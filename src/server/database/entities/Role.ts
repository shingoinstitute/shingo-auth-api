import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Permission } from './Permission'
import { User } from './User'
import { Type } from 'class-transformer'

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    id!: number

    @Column('text')
    name!: string

    @Column()
    service!: string

    @Type(() => Permission)
    @ManyToMany(_type => Permission, permission => permission.roles, { eager: true })
    @JoinTable()
    permissions!: Permission[]

    @Type(() => User)
    @ManyToMany(_type => User, user => user.roles)
    users!: User[]
}
