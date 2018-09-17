import { loggerFactory } from './logger.service'
import { User } from './database/mysql.service'
import * as scrypt from 'scrypt'
import _ from 'lodash'
import { NotFoundError } from './util'
import { Service } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Repository } from 'typeorm'
import {
  RoleOperation,
  UserCreateData,
  RequireKeys,
} from '@shingo/auth-api-shared'

@Service()
export class UserService {
  auditLog = loggerFactory('auth-api.audit.log')

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createData: Partial<UserCreateData>): Promise<User> {
    if (
      !createData.email ||
      !createData.password ||
      !createData.services ||
      !createData.extId
    ) {
      throw new Error('Invalid user creation data')
    }
    const user = new User()
    user.email = createData.email
    user.password = (await scrypt.kdf(
      createData.password,
      scrypt.paramsSync(0.1),
    )).toString('base64')
    user.services = createData.services

    user.extId = createData.extId

    return this.userRepository.save(user).then(data => {
      this.auditLog.info('User created %j', data)
      return data
    })
  }

  async read(clause: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'role_perms')
      .where(clause)
      .getMany()
  }

  async readOne(clause: string): Promise<User | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'role_perms')
      .where(clause)
      .getOne()
  }

  async update(
    updateData:
      | RequireKeys<Partial<User>, 'id'>
      | RequireKeys<Partial<User>, 'extId'>,
  ): Promise<boolean> {
    this.auditLog.debug('Update data: %j', updateData)

    const existingUser =
      typeof updateData.id !== 'undefined'
        ? await this.userRepository.findOne(updateData.id)
        : await this.userRepository.findOne({ extId: updateData.extId })

    if (typeof existingUser === 'undefined') {
      throw typeof updateData.id !== 'undefined'
        ? new NotFoundError(`Id, ${updateData.id}, did not map to a user.`)
        : new NotFoundError(
            `External Id, ${updateData.extId}, did not map to a user.`,
          )
    }

    const newPassword =
      typeof updateData.password !== 'undefined'
        ? {
            password: await scrypt
              .kdf(updateData.password, scrypt.paramsSync(0.1))
              .then(b => b.toString('base64')),
          }
        : {}

    const update = { ...updateData, id: existingUser.id, ...newPassword }

    return this.userRepository
      .save(this.userRepository.create(update))
      .then(data => {
        this.auditLog.info('User updated. patch: %j, new: %j', update, data)
        return true
      })
  }

  async delete(
    user:
      | RequireKeys<Partial<User>, 'id'>
      | RequireKeys<Partial<User>, 'extId'>,
  ): Promise<boolean> {
    if (typeof user.id === 'undefined' && user.extId) {
      const oldUser = await this.userRepository.findOne({ extId: user.extId })
      if (typeof oldUser === 'undefined') {
        throw new NotFoundError(
          `External Id, ${user.extId}, did not map to a user.`,
        )
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
    const { userEmail, roleId } = roleOp

    this.auditLog.debug('Trying to add role to user: %j', roleOp)

    const user = await this.userRepository.findOne(
      { email: userEmail },
      { relations: ['roles'], loadEagerRelations: false },
    )

    if (typeof user === 'undefined') throw new NotFoundError('Email Not Found')

    const updateData = {
      id: user.id,
      roles: [...(user.roles || []), { id: roleId }],
    }

    return this.userRepository.save(updateData).then(() => {
      this.auditLog.info('User role added: %j', roleOp)
      return true
    })
  }

  async removeRole(roleOp: RoleOperation): Promise<boolean> {
    const { userEmail, roleId } = roleOp

    const user = await this.userRepository.findOne(
      { email: userEmail },
      { relations: ['roles'], loadEagerRelations: false },
    )

    if (typeof user === 'undefined') throw new NotFoundError('Email Not Found')

    const updateData = {
      id: user.id,
      roles: (user.roles || []).filter(role => role.id !== roleId),
    }

    return this.userRepository.save(updateData).then(data => {
      this.auditLog.info('User role removed: %j', data)
      return true
    })
  }
}
