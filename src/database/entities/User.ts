import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, BaseEntity } from 'typeorm'
import { Role } from './Role'
import { Permission } from './Permission'

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true, length: "255" })
    extId!: string;

    @Column({ unique: true, length: "255" })
    email!: string;

    @Column({ length: "255" })
    password!: string;

    @Column({ default: true })
    isEnabled!: boolean;

    @Column({ length: "1024" })
    jwt!: string;

    @Column({ length: "1024", default: '' })
    resetToken!: string;

    @Column({ nullable: true, length: "255" })
    lastLogin!: string;

    @ManyToMany(_type => Role, role => role.users)
    roles: Role[] = [];

    @Column({ default: "" })
    services!: string;

    @ManyToMany(_type => Permission, permission => permission.users)
    permissions: Permission[] = [];
}
