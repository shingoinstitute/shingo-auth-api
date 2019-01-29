import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Role } from './Role'
import { Permission } from './Permission'
import { User as U } from '@shingo/auth-api-shared'

@Entity()
export class User extends U {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ nullable: true, length: '255' })
  extId!: string

  @Column({ unique: true, length: '255' })
  email!: string

  @Column({ length: '255' })
  password!: string

  @Column({ type: 'simple-array' })
  services!: string[]

  @Column({ default: true })
  isEnabled!: boolean

  @Column({ length: '1024', default: '' })
  resetToken!: string

  @Column({ nullable: true, length: '255' })
  lastLogin!: string

  @ManyToMany(_type => Role, role => role.users, { eager: true })
  @JoinTable()
  roles!: Role[]

  @ManyToMany(_type => Permission, permission => permission.users, {
    eager: true,
  })
  @JoinTable()
  permissions!: Permission[]
}
