import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  BaseEntity,
} from 'typeorm'
import { Role } from './Role'
import { User } from './User'
import { Type } from 'class-transformer'
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateIf,
  IsEmpty,
} from 'class-validator'

export enum Level {
  Deny = 0,
  Read = 1,
  Write = 2,
}
@Entity()
export class Permission extends BaseEntity {
  @IsOptional({ groups: ['create', 'delete'] })
  @IsEmpty({ groups: ['create'] })
  @IsNumber(undefined, { always: true })
  @PrimaryGeneratedColumn()
  id!: number

  @ValidateIf(o => typeof o.id === 'undefined', { groups: ['delete'] })
  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  @Column()
  resource!: string

  @ValidateIf(o => typeof o.id === 'undefined', { groups: ['delete'] })
  @IsOptional({ groups: ['update'] })
  @IsNumber(undefined, { always: true })
  @IsIn([0, 1, 2], { always: true })
  @Column('int')
  level!: Level // 0 - deny, 1 - read, 2 - write

  @Type(() => Role)
  @ManyToMany(_type => Role, role => role.permissions)
  roles!: Role[]

  @Type(() => User)
  @ManyToMany(_type => User, user => user.permissions)
  users!: User[]
}
