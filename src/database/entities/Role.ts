import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Permission } from './Permission'
import { User } from './User'

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id : number;

    @Column('text')
    name : string;

    @Column('string')
    service : string = '';

    @ManyToMany(type => Permission, permission => permission.roles, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    permissions : Permission[] = [];

    @ManyToMany(type => User, user => user.roles)
    @JoinTable()
    users: User[] = [];

}