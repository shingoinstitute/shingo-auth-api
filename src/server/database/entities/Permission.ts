import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, BaseEntity } from 'typeorm'
import { Role } from './Role'
import { User } from './User'
import { Type } from 'class-transformer'

export enum Level { Deny = 0, Read = 1, Write = 2 }
@Entity()
export class Permission extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    resource!: string

    @Column('int')
    level!: Level // 0 - deny, 1 - read, 2 - write

    @Type(() => Role)
    @ManyToMany(_type => Role, role => role.permissions)
    roles!: Role[]

    @Type(() => User)
    @ManyToMany(_type => User, user => user.permissions)
    users!: User[]
}
