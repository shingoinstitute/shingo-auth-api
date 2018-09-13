import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Permission } from './Permission'
import { User } from './User'
import { Role as R } from '../../../../shared/src/Role'

@Entity()
export class Role extends R {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text')
  name!: string

  @Column()
  service!: string

  @ManyToMany(_type => Permission, permission => permission.roles, {
    eager: true,
  })
  @JoinTable()
  permissions!: Permission[]

  @ManyToMany(_type => User, user => user.roles)
  users!: User[]
}
