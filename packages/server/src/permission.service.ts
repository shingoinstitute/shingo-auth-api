import { Permission } from './database/mysql.service'
import _ from 'lodash'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Service, Inject } from 'typedi'
import { PermissionCreateData, RequireKeys } from '@shingo/auth-api-shared'
import { AUDIT_LOGGER } from './constants'
import { Logger } from 'winston'

@Service()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @Inject(AUDIT_LOGGER) private auditLog: Logger,
  ) {}

  private create(permission: PermissionCreateData): Promise<Permission> {
    return this.permissionRepository
      .save(this.permissionRepository.create(permission))
      .then(p => {
        this.auditLog.info('Permission created: %j', permission)
        return p
      })
  }

  readOrCreate(
    permission: PermissionCreateData,
    readFull = false,
  ): Promise<Permission> {
    return (readFull
      ? this.readOne(
          `permission.level = ${permission.level} AND permission.resource = '${
            permission.resource
          }'`,
        )
      : this.permissionRepository.findOne(permission)
    ).then(p => (typeof p === 'undefined' ? this.create(permission) : p))
  }

  // FIXME: Possible SQL Injection
  read(clause: string): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.users', 'users')
      .leftJoinAndSelect('permission.roles', 'roles')
      .where(clause)
      .getMany()
  }

  // FIXME: Possible SQL Injection
  readOne(clause: string): Promise<Permission | undefined> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.users', 'users')
      .leftJoinAndSelect('permission.roles', 'roles')
      .where(clause)
      .getOne()
  }

  update(permission: RequireKeys<Partial<Permission>, 'id'>): Promise<boolean> {
    return this.permissionRepository.save(permission).then(data => {
      this.auditLog.info(
        'Permisson updated. patch: %j, new: %j',
        permission,
        data,
      )
      return true
    })
  }

  async delete(
    permission:
      | RequireKeys<Partial<Permission>, 'id'>
      | RequireKeys<Partial<Permission>, 'resource' | 'level'>,
  ): Promise<boolean> {
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
