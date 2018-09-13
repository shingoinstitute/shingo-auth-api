import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Permission } from './Permission'
import { User } from './User'
import { Type } from 'class-transformer'
import { IsNumber, IsString, IsOptional, IsEmpty } from 'class-validator'

@Entity()
export class Role {
  @IsOptional({ groups: ['create'] })
  @IsEmpty({ groups: ['create'] })
  @IsNumber(undefined, { always: true })
  @PrimaryGeneratedColumn()
  id!: number

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  @Column('text')
  name!: string

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  @Column()
  service!: string

  @Type(() => Permission)
  @ManyToMany(_type => Permission, permission => permission.roles, {
    eager: true,
  })
  @JoinTable()
  permissions!: Permission[]

  @Type(() => User)
  @ManyToMany(_type => User, user => user.roles)
  users!: User[]
}
