import { loggerFactory } from '../shared/logger.service'
import { Role } from './database/mysql.service'
import _ from 'lodash'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Service } from 'typedi'
import * as M from '../shared/messages'

@Service()
export class RoleService {

  auditLog = loggerFactory('auth-api.audit.log')

  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

  async create(role: M.Role): Promise<M.Role> {
    const cleanRole = role.id ? _.omit(role, [ 'id' ]) : role

    return this.roleRepository.save(cleanRole as Role).then(c => {
      this.auditLog.info('Role created: %j', cleanRole)
      return c
    })
  }

  async read(clause: string): Promise<M.Role[]> {
    return this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .where(clause)
      .getMany()
  }

  async readOne(clause: string): Promise<M.Role | undefined> {
    return this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .where(clause)
      .getOne()
  }

  async update(role: M.Role): Promise<boolean> {
    return this.roleRepository.save(role).then(() => {
      this.auditLog.info('Role updated: %j', role)
      return true
    })
  }

  async delete(role: M.Role): Promise<boolean> {
    return this.roleRepository.delete(role.id).then(() => {
      this.auditLog.info('Role deleted: %j', role)
      return true
    })
  }
}
