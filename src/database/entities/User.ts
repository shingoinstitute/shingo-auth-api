import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Role } from './Role'
import { Permission } from './Permission'

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('string', { nullable: true, length: "255" })
    extId: string;

    @Column('string', { unique: true, length: "255" })
    email: string;

    @Column('string', { unique: true, length: "255" })
    password: string;

    @Column('boolean', { default: true })
    isEnabled: boolean;

    @Column('string', { length: "1024" })
    jwt: string;

    @Column('string', { length: "1024", default: '' })
    resetToken: string;

    @Column('string', { nullable: true, length: "255" })
    lastLogin: string;

    @ManyToMany(type => Role, role => role.users, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    roles: Role[] = [];

    @Column('string', { default: "" })
    services: string;

    @ManyToMany(type => Permission, permission => permission.users, {
        cascadeInsert: false,
        cascadeUpdate: false
    })
    permissions: Permission[] = [];

}