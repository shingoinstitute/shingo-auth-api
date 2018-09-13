import { User, Role } from './database/mysql.service'
import { UserService } from './user.service'
import { PermissionService } from './permission.service'
import * as scrypt from 'scrypt'
import _ from 'lodash'
import { NotFoundError } from './util'
import { Service, Inject } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Repository } from 'typeorm'
import { LOGGER, AUDIT_LOGGER } from './constants'
import { LoggerInstance } from 'winston'
import { JWTService } from './jwt.service'
import {
  Credentials,
  AccessRequest,
  GrantRequest,
  LoginAsRequest,
  PermissionSet,
  JWTPayload,
} from '@shingo/auth-api-shared'

// This api is full of potential sql injection :(

@Service()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private userService: UserService,
    private permissionService: PermissionService,
    private jwtService: JWTService,
    @Inject(LOGGER) private log: LoggerInstance,
    @Inject(AUDIT_LOGGER) private auditLog: LoggerInstance,
  ) {}

  async login(creds: Credentials): Promise<string> {
    const user = await this.userRepository.findOne({ email: creds.email })

    if (typeof user === 'undefined') {
      this.auditLog.warn(
        '[EMAIL_NOT_FOUND] Invalid log in attempt: ' +
          creds.email +
          '@' +
          creds.services,
      )
      throw new Error('EMAIL_NOT_FOUND')
    }

    const matches = await scrypt.verifyKdf(
      new Buffer(user.password, 'base64'),
      creds.password,
    )

    if (!matches) {
      this.auditLog.warn(
        '[INVALID_PASSWORD] Invalid log in attempt: ' +
          creds.email +
          '@' +
          creds.services,
      )
      throw new Error('INVALID_PASSWORD')
    }

    const token = await this.jwtService.issue({
      email: creds.email,
      extId: user.extId,
    })

    const updateData = {
      id: user.id,
      lastLogin: new Date().toUTCString(),
    }

    await this.userService.update(updateData)
    this.auditLog.info(
      'Successful login: ' + creds.email + '@' + creds.services,
    )
    return token
  }

  async isValid(token: string): Promise<JWTPayload | false> {
    return this.jwtService.isValid(token)
  }

  private userHasAccess(user: User, ...reqs: AccessRequest[]): AccessRequest[] {
    const permissions = (user.permissions || []).concat(
      ...(user.roles || []).map(r => r.permissions || []),
    )
    // if some permission fills the requirements for the request, then filter that request into the new array
    return reqs.filter(r =>
      permissions.some(p => p.resource === r.resource && p.level >= r.level),
    )
  }

  async canAccess(accessRequest: AccessRequest): Promise<boolean> {
    const user = await this.userRepository.findOne({
      email: accessRequest.email,
    })

    if (typeof user === 'undefined') {
      this.auditLog.warn(
        '[USER_NOT_FOUND]  accessRequest denied: %j',
        accessRequest,
      )
      return false
    }

    const accepted = this.userHasAccess(user, accessRequest)

    if (accepted.length > 0) {
      this.auditLog.info('accessRequest accepted: %j', accessRequest)
    } else {
      this.auditLog.warn(
        '[NO_PERMISSION_FOUND]  accessRequest denied: %j',
        accessRequest,
      )
    }

    return accepted.length > 0
  }

  async grantToUser(grantRequest: GrantRequest): Promise<PermissionSet> {
    const permission = await this.permissionService
      .readOne(
        `permission.resource='${grantRequest.resource}' AND permission.level=${
          grantRequest.level
        }`,
      )
      .then(
        p =>
          typeof p === 'undefined'
            ? this.permissionService.create({
                resource: grantRequest.resource,
                level: grantRequest.level,
              })
            : p,
      )

    const updateData = {
      id: permission.id,
      users: [
        ...(permission.users || []),
        this.userRepository.create({ id: grantRequest.accessorId }),
      ],
    }

    await this.permissionService.update(updateData)
    this.auditLog.info('[USER]  Permission Grant Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async grantToRole(grantRequest: GrantRequest): Promise<PermissionSet> {
    const permission = await this.permissionService
      .readOne(
        `permission.resource='${grantRequest.resource}' AND permission.level=${
          grantRequest.level
        }`,
      )
      .then(
        p =>
          typeof p === 'undefined'
            ? this.permissionService.create({
                resource: grantRequest.resource,
                level: grantRequest.level,
              })
            : p,
      )

    const updateData = {
      id: permission.id,
      roles: [
        ...(permission.roles || []),
        ({ id: grantRequest.accessorId } as any) as Role,
      ],
    }

    await this.permissionService.update(updateData)
    this.auditLog.info('[ROLE]  Permission Grant Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async revokeFromUser(grantRequest: GrantRequest): Promise<PermissionSet> {
    const permission = await this.permissionService.readOne(
      `permission.resource='${grantRequest.resource}' AND permission.level=${
        grantRequest.level
      }`,
    )

    if (typeof permission === 'undefined') {
      throw new Error('PERMISSION_NOT_FOUND')
    }

    const updateData = {
      id: permission.id,
      users: permission.users.filter(
        user => user.id !== grantRequest.accessorId,
      ),
    }

    await this.permissionService.update(updateData)
    this.auditLog.info('[USER]  Permission Revoke Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  async revokeFromRole(grantRequest: GrantRequest): Promise<PermissionSet> {
    const permission = await this.permissionService.readOne(
      `permission.resource='${grantRequest.resource}' AND permission.level=${
        grantRequest.level
      }`,
    )

    if (typeof permission === 'undefined') {
      throw new Error('PERMISSION_NOT_FOUND')
    }

    const updateData = {
      id: permission.id,
      roles: permission.roles.filter(
        role => role.id !== grantRequest.accessorId,
      ),
    }

    await this.permissionService.update(updateData)
    this.auditLog.info('[ROLE]  Permission Revoke Request : %j', grantRequest)

    return { permissionId: permission.id, accessorId: grantRequest.accessorId }
  }

  /**
   * Issues a jwt for an arbitrary user to an admin user if they have permission
   * @param loginAsRequest login request data
   */
  async loginAs(loginAsRequest: LoginAsRequest): Promise<string> {
    const { adminId, userId } = loginAsRequest
    const adminUser = await this.userRepository.findOneOrFail({ id: adminId })

    const requests: AccessRequest[] = [
      {
        resource: `user -- ${userId}`,
        level: 1,
        email: adminUser.email,
        id: `${adminUser.id}`,
      },
      {
        resource: `user -- all_users`,
        level: 1,
        email: adminUser.email,
        id: `${adminUser.id}`,
      },
    ]

    const hasPerm =
      this.userHasAccess(adminUser, ...requests).length > 0 ||
      // for backwards compatibility, Affiliate Manager essentially has full permissions to resource 'user -- all_users'
      (adminUser.roles || []).some(r => r.name === 'Affiliate Manager')

    if (!hasPerm) {
      this.log.error(
        "User %d does not have sufficient permission to access 'user -- %d'",
        adminId,
        userId,
      )
      throw new Error(`Invalid Permissions for 'user -- ${userId}'`)
    }

    const reqUser = await this.userRepository.findOne({ id: userId })

    if (!reqUser) {
      throw new NotFoundError('Invalid User ID')
    }

    this.auditLog.info('Login As Request Successful: %j', loginAsRequest)

    return this.jwtService.issue({ email: reqUser.email, extId: reqUser.extId })
  }
}
