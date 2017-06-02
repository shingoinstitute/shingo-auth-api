import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class Auth {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('string', { unique: true, length: "255" })
    email: string;

    @Column('string', { unique: true, length: "255" })
    password: string;

    @Column('boolean', { default: true })
    isEnabled: boolean;

    @OneToOne(type => User, user => user.auth, {
        cascadeRemove: true
    })
    user : User;

}