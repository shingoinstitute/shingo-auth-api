import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { Role } from './Role'
import { Auth } from './Auth'
import { Permission } from './Permission'

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id : number;

    @Column('text')
    jwt : string;

    @ManyToOne(type => Role, role => role.users)
    role : Role;

    @OneToOne(type => Auth, auth => auth.user, {
        cascadeAll: false
    })
    @JoinColumn()
    auth : Auth;

    @ManyToMany(type => Permission, permission => permission.users, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    permissions : Permission[] = [];

}