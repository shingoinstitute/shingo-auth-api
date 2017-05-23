import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, JoinColumn } from 'typeorm'
import { Permission } from './Permission'
import { User } from './User'

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    name : string;

    @ManyToMany(type => Permission, permission => permission.hasRole, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    @JoinTable()
    permissions : Permission[] = [];

    @OneToMany(type => User, user => user.role)
    users: User[] = [];

}