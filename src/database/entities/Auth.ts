import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class Auth {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    isEnabled: boolean = true;

    @OneToOne(type => User, user => user.auth, {
        cascadeRemove: true
    })
    user : User;

}