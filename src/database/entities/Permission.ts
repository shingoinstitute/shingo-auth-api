import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, BaseEntity } from 'typeorm'
import { Role } from './Role'
import { User } from './User'

export enum Level { Deny = 0, Read = 1, Write = 2 }
@Entity()
export class Permission extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column('string')
    resource!: string;
    
    @Column('int')
    level!: Level; // 0 - deny, 1 - read, 2 - write

    @ManyToMany(_type => Role, role => role.permissions)
    @JoinTable()
    roles: Role[] = [];

    @ManyToMany(_type => User, user => user.permissions)
    @JoinTable()
    users: User[] = [];
}