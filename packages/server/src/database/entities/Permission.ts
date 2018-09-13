import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'
import { Role } from './Role'
import { User } from './User'
import { Permission as P } from '../../../../shared/src/Permission'
import { Level } from '../../../../shared/src/auth_services.interface'

@Entity()
export class Permission extends P {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  resource!: string

  @Column('int')
  level!: Level // 0 - deny, 1 - read, 2 - write

  @ManyToMany(_type => Role, role => role.permissions)
  roles!: Role[]

  @ManyToMany(_type => User, user => user.permissions)
  users!: User[]
}
