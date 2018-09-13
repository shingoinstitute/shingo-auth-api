import { Permission, Level } from './database/mysql.service'
import _ from 'lodash'
import { loggerFactory } from '../shared/logger.service'
import { RequireKeys } from '../shared/util'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Service } from 'typedi'

export interface PermissionCreateData {
  resource: string
  level: Level
}

@Service()
export class PermissionService {
  auditLog = loggerFactory('auth-api.audit.log')

  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(permission: PermissionCreateData): Promise<Permission> {
    return this.permissionRepository
      .create(permission)
      .save()
      .then(p => {
        this.auditLog.info('Permission created: %j', permission)
        return p
      })
  }

  // FIXME: Possible SQL Injection
  async read(clause: string): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.users', 'users')
      .leftJoinAndSelect('permission.roles', 'roles')
      .where(clause)
      .getMany()
  }

  // FIXME: Possible SQL Injection
  async readOne(clause: string): Promise<Permission | undefined> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.users', 'users')
      .leftJoinAndSelect('permission.roles', 'roles')
      .where(clause)
      .getOne()
  }

  async update(
    permission: RequireKeys<Partial<Permission>, 'id'>,
  ): Promise<boolean> {
    return this.permissionRepository.save(permission).then(data => {
      this.auditLog.info(
        'Permisson updated. patch: %j, new: %j',
        permission,
        data,
      )
      return true
    })
  }

  async delete(permission: Permission): Promise<boolean> {
    const id = await (typeof permission.id === 'undefined'
      ? this.permissionRepository
          .findOne({ resource: permission.resource, level: permission.level })
          .then(p => p && p.id)
      : Promise.resolve(permission.id))

    if (!id) return true

    return this.permissionRepository
      .remove(this.permissionRepository.create({ id }))
      .then(() => {
        this.auditLog.info('Permission deleted: %j', permission)
        return true
      })
  }
}
