import { loggerFactory } from '../shared/logger.service'
import { User, jwtSecret } from './database/mysql.service'
import * as scrypt from 'scrypt'
import * as jwt from 'jsonwebtoken'
import _ from 'lodash'
import { NotFoundError } from '../shared/util'
import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Repository } from 'typeorm'
import * as Messages from '../shared/messages'

export interface Credentials {
    email: string,
    password: string,
    services?: string
}

export interface RoleOperation {
    userEmail: string,
    roleId: number
}

@Service()
export class UserService {

  auditLog = loggerFactory('auth-api.audit.log')

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(creds: { email: string,
                        password: string,
                        services: string,
                        extId: string
                      }): Promise<_.Omit<User, 'password'>> {
    const user = new User()
    user.email = creds.email
    user.password = (await scrypt.kdfSync(creds.password, scrypt.paramsSync(0.1))).toString('base64')
    user.services = creds.services

    user.jwt = jwt.sign({
      user: `${user.id}:${user.email}:${user.password}`,
      expires: new Date(new Date().getTime() + 600000),
    }, jwtSecret)

    user.extId = creds.extId

    const created = await this.userRepository.save(user)
    const returned = { ..._.omit(created, ['password']), permissions: [], roles: [] }

    this.auditLog.info('User created: %j', returned)

    return returned
  }

  async read(clause: string): Promise<User[]> {
    return this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.permissions', 'permissions')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('roles.permissions', 'roles.permissions')
        .where(clause)
        .getMany()
  }

  async readOne(clause: string): Promise<User | undefined> {
    return this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.permissions', 'permissions')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('roles.permissions', 'roles.permissions')
        .where(clause)
        .getOne()
  }

  async update(updateData: Messages.User): Promise<boolean> {
    const existingUser = typeof updateData.id !== 'undefined'
        ? await this.userRepository.findOne(updateData.id)
        : await this.userRepository.findOne({ extId: updateData.extId })

    if (typeof existingUser === 'undefined') {
      throw typeof updateData.id !== 'undefined'
        ? new NotFoundError(`Id, ${updateData.id}, did not map to a user.`)
        : new NotFoundError(`External Id, ${updateData.extId}, did not map to a user.`)
    }

    const newPassword =
      typeof updateData.password !== 'undefined'
        ? { password: await scrypt.kdf(updateData.password, scrypt.paramsSync(0.1)).then(b => b.toString('base64')) }
        : {}

    const newJwt =
      typeof newPassword.password !== 'undefined'
        ? { jwt: jwt.sign({
              user: `${existingUser.id}:${updateData.email || existingUser.email}:${newPassword}`,
              expires: new Date(new Date().getTime() + 600000),
            }, jwtSecret),
          }
        : {}

    const update = { ...updateData, id: existingUser.id, ...newPassword, ...newJwt }

    return this.userRepository.update(update.id, update).then(() => {
      this.auditLog.info('User updated: %j', update)
      return true
    })
  }

  async delete(user: Messages.User): Promise<boolean> {
    if (typeof user.id === 'undefined' && user.extId) {
      const oldUser = await this.userRepository.findOne({ extId: user.extId })
      if (typeof oldUser === 'undefined') {
        throw new NotFoundError(`External Id, ${user.extId}, did not map to a user.`)
      }
      user.id = oldUser.id
    }

    if (user.email === '') return true

    return this.userRepository.remove(user as User).then(() => {
      this.auditLog.info('User deleted: %j', user)
      return true
    })
  }

  async addRole(roleOp: RoleOperation): Promise<boolean> {
    const userEmail = roleOp.userEmail
    const roleId = roleOp.roleId
    this.auditLog.info('Trying to add role to user: %j', roleOp)

    const user = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .where(`user.email='${userEmail}'`)
        .getOne()

    if (typeof user === 'undefined') throw new NotFoundError('Email Not Found')

    delete user.permissions

    user.roles.push({ id: roleId } as any)

    return this.userRepository.save(user).then(() => {
      this.auditLog.info('User role added: %j', roleOp)
      return true
    })
  }

  async removeRole(roleOp: RoleOperation): Promise<boolean> {
    const userEmail = roleOp.userEmail
    const roleId = roleOp.roleId

    const user = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .where(`user.email='${userEmail}'`)
        .getOne()

    if (typeof user === 'undefined') throw new NotFoundError('Email Not Found')

    user.roles = user.roles.filter(role => role.id !== roleId)

    delete user.permissions

    return this.userRepository.save(user).then(() => {
      this.auditLog.info('User role removed: %j', user)
      return true
    })
  }

}
