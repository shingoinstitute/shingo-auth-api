import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Role } from './Role'
import { Permission } from './Permission'
import { Exclude, Type } from 'class-transformer'

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: true, length: '255' })
    extId!: string

    @Column({ unique: true, length: '255' })
    email!: string

    @Exclude({ toPlainOnly: true })
    @Column({ length: '255' })
    password!: string

    @Column({ default: true })
    isEnabled!: boolean

    @Column({ length: '1024', default: '' })
    resetToken!: string

    @Column({ nullable: true, length: '255' })
    lastLogin!: string

    @Type(() => Role)
    @ManyToMany(_type => Role, role => role.users, { eager: true })
    @JoinTable()
    roles!: Role[]

    @Column({ default: '' })
    services!: string

    @Type(() => Permission)
    @ManyToMany(_type => Permission, permission => permission.users, { eager: true })
    @JoinTable()
    permissions!: Permission[]
}
