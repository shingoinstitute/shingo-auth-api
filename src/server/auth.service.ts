import { loggerFactory } from '../shared/logger.service'
import { Permission, User, Role, jwtSecret } from './database/mysql.service'
import { Credentials, UserService } from './user.service'
import { PermissionService } from './permission.service'
import * as scrypt from 'scrypt'
import _ from 'lodash'
import * as jwt from 'jsonwebtoken'
import { NotFoundError } from '../shared/util'
import { Service } from 'typedi'
import * as M from '../shared/messages'

export interface AccessRequest {
    resource: string,
    level: number,
    jwt: string
}

export interface GrantRequest {
    resource: string,
    level: number,
    accessorId: number
}

export interface PermissionSet {
    permissionId: number,
    accessorId: number
}

export interface LoginAsRequest {
    adminId: number,
    userId: number
}

@Service()
export class AuthService {

  private log = loggerFactory()
  private auditLog = loggerFactory('auth-api.audit.log')

  constructor(private userService: UserService,
              private permissionService: PermissionService) {}

  async login(creds: Credentials): Promise<M.User> {
    try {
      let user = await this.userService.readOne(`user.email='${creds.email}'`)

      if (typeof user === 'undefined') {
          this.auditLog.warn('[EMAIL_NOT_FOUND] Invalid log in attempt: ' + creds.email + '@' + creds.services)
          throw new Error('EMAIL_NOT_FOUND')
      }

      const matches = await scrypt.verifyKdf(new Buffer(user.password, 'base64'), creds.password)

      if (!matches) {
          this.auditLog.warn('[INVALID_PASSWORD] Invalid log in attempt: ' + creds.email + '@' + creds.services)
          throw new Error('INVALID_PASSWORD')
      }

      user.jwt =
        jwt.sign({
          user: `${user.id}:${user.email}:${user.password}`,
          expires: new Date(new Date().getTime() + 60000000),
        }, jwtSecret)

      user = _.omit(user, ['password'])
      user.lastLogin = new Date().toUTCString()

      await this.userService.update(_.omit(user, ['permissions', 'roles']))
      this.auditLog.info('Successful login: ' + creds.email + '@' + creds.services)
      return user
    } catch (error) {
      this.log.error('Error logging in: ', error)
      throw error
    }
  }

  async isValid(token: string): Promise<boolean> {
    if (token === '' || typeof token === 'undefined') throw new Error('INVALID_TOKEN')
    const user = await this.userService.readOne(`user.jwt='${token}'`)

    if (!user) {
        this.auditLog.warn('[INVALID_TOKEN] isValid returned false' + token)
        return Promise.resolve(false)
    }

    const decoded = jwt.verify(token, jwtSecret)
    if (typeof decoded === 'string') {
      this.auditLog.warn('[INVALID_TOKEN] isValid returned false' + token)
      return false
    }

    if (decoded.user !== `${user.id}:${user.email}:${user.password}`) {
        this.auditLog.warn('[INVALID_TOKEN]  isValid returned false' + token)
        return false
    }
    if (new Date(decoded.expires) <= new Date()) {
        this.auditLog.warn('[EXPIRED_TOKEN]  isValid returned false' + token)
        return false
    }

    this.auditLog.info('isValid returned true')

    return true
  }

  async canAccess(accessRequest: AccessRequest): Promise<boolean> {
    const user = await this.userService.readOne(`user.jwt='${accessRequest.jwt}'`)

    if (typeof user === 'undefined') {
        this.auditLog.warn('[USER_NOT_FOUND]  accessRequest denied: %j', accessRequest)
        return false
    }

    let permissions = user.permissions

    for (const role of user.roles) {
        permissions = permissions.concat(role.permissions)
    }

    for (const permission of permissions) {
        if (permission.resource === accessRequest.resource && permission.level >= accessRequest.level) {
            this.auditLog.info('accessRequest accepted: %j', accessRequest)
            return true
        }
    }

    this.auditLog.warn('[NO_PERMISSION_FOUND]  accessRequest denied: %j', accessRequest)

    return false
  }

  async grantToUser(grantRequest: GrantRequest): Promise<PermissionSet> {
    let permission =
      await this.permissionService
                .readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`)

    if (typeof permission === 'undefined') {
      permission = await this.permissionService.create({ resource: grantRequest.resource, level: grantRequest.level })
    }

    permission.users.push({ id: grantRequest.accessorId } as User)
    await this.permissionService.update(_.omit(permission, ['roles']))
    this.auditLog.info('[USER]  Permission Grant Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async grantToRole(grantRequest: GrantRequest): Promise<PermissionSet> {
    let permission =
      await this.permissionService
                .readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`)

    if (typeof permission === 'undefined') {
      permission = await this.permissionService.create({ resource: grantRequest.resource, level: grantRequest.level })
    }

    permission.roles.push({ id: grantRequest.accessorId } as Role)
    await this.permissionService.update(_.omit(permission, ['users']))
    this.auditLog.info('[ROLE]  Permission Grant Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async revokeFromUser(grantRequest: GrantRequest): Promise<PermissionSet> {
    const permission =
      await this.permissionService
                .readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`)

    if (typeof permission === 'undefined') throw new Error('PERMISSION_NOT_FOUND')

    permission.users = permission.users.filter(user => user.id !== grantRequest.accessorId)
    await this.permissionService.update(_.omit(permission, ['roles']))
    this.auditLog.info('[USER]  Permission Revoke Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async revokeFromRole(grantRequest: GrantRequest): Promise<PermissionSet> {
    const permission =
      await this.permissionService
                .readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`)

    if (typeof permission === 'undefined') throw new Error('PERMISSION_NOT_FOUND')

    permission.roles = permission.roles.filter(role => role.id !== grantRequest.accessorId)
    await this.permissionService.update(_.omit(permission, ['users']))
    this.auditLog.info('[ROLE]  Permission Revoke Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async loginAs(loginAsRequest: LoginAsRequest): Promise<User> {
    const user = await this.userService.readOne(`user.id='${loginAsRequest.userId}'`)

    if (!user) {
      throw new NotFoundError('Invalid User ID')
    }

    user.jwt = jwt.sign({
      user: `${user.id}:${user.email}:${user.password}`,
      expires: new Date(new Date().getTime() + 60000000),
    }, jwtSecret)

    await this.userService.update(_.omit(user, ['permissions', 'roles', 'password']))

    this.auditLog.info('Login As Request : %j', loginAsRequest)
    return user
  }

}
