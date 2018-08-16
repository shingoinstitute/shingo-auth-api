import { loggerFactory } from '../shared/logger.service'
import { Role } from './database/mysql.service'
import _ from 'lodash'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Service } from 'typedi'
import * as M from '../shared/messages'

export interface RoleCreateData  {
  name: string
  service: string
}

@Service()
export class RoleService {

  auditLog = loggerFactory('auth-api.audit.log')

  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

  async create(role: RoleCreateData): Promise<M.Role> {
    const cleanRole = (role as any).id ? _.omit(role, [ 'id' ]) : role

    return this.roleRepository.save(cleanRole as Role).then(c => {
      this.auditLog.info('Role created: %j', cleanRole)
      return c
    })
  }

  // FIXME: Possible SQL Injection
  async read(clause: string): Promise<M.Role[]> {
    return this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .where(clause)
      .getMany()
  }

  // FIXME: Possible SQL Injection
  async readOne(clause: string): Promise<M.Role | undefined> {
    return this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .where(clause)
      .getOne()
  }

  async update(role: M.Role): Promise<boolean> {
    return this.roleRepository.save(this.roleRepository.create(role)).then(data => {
      this.auditLog.info('Role updated. patch: %j, new: %j', role, data)
      return true
    })
  }

  async delete(role: M.Role): Promise<boolean> {
    // see https://github.com/typeorm/typeorm/issues/1767#issuecomment-373819662 for documentation on deletion by id
    return this.roleRepository.remove(this.roleRepository.create(role)).then(() => {
      this.auditLog.info('Role deleted: %j', role)
      return true
    })
  }
}
