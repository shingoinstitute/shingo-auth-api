import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Role } from './Role'
import { User } from './User'

export enum Level{Deny = 0, Read = 1, Write = 2 }
@Entity()
export class Permission {


    @PrimaryGeneratedColumn()
    id : number;

    @Column('text')
    resource : string;
    
    @Column('int')
    level: number; // 0 - deny, 1 - read, 2 - write

    @ManyToMany(type => Role, role => role.permissions, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    @JoinTable()
    roles: Role[] = [];

    @ManyToMany(type => User, user => user.permissions, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    @JoinTable()
    users : User[] = [];
}