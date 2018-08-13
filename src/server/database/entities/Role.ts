import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, BaseEntity } from 'typeorm'
import { Permission } from './Permission'
import { User } from './User'

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column('text')
    name!: string;

    @Column('string')
    service: string = '';

    @ManyToMany(_type => Permission, permission => permission.roles)
    permissions: Permission[] = [];

    @ManyToMany(_type => User, user => user.roles)
    @JoinTable()
    users: User[] = [];
}