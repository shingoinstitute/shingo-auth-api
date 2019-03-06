import { Role } from './database/mysql.service'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Service } from 'typedi'
import { RequireKeys } from '@shingo/auth-api-shared'

@Service()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async create(role: Role): Promise<Role> {
    return this.roleRepository.save(role).then(c => {
      console.info('Role created: %j', role)
      return c
    })
  }

  // FIXME: Possible SQL Injection
  async read(clause: string): Promise<Role[]> {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .where(clause)
      .getMany()
  }

  // FIXME: Possible SQL Injection
  async readOne(clause: string): Promise<Role | undefined> {
    return this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users')
      .where(clause)
      .getOne()
  }

  async update(role: RequireKeys<Partial<Role>, 'id'>): Promise<boolean> {
    return this.roleRepository.save(role).then(data => {
      console.info('Role updated. patch: %j, new: %j', role, data)
      return true
    })
  }

  async delete(role: RequireKeys<Partial<Role>, 'id'>): Promise<boolean> {
    // see https://github.com/typeorm/typeorm/issues/1767#issuecomment-373819662 for documentation on deletion by id
    return this.roleRepository
      .remove(this.roleRepository.create(role))
      .then(() => {
        console.info('Role deleted: %j', role)
        return true
      })
  }
}
