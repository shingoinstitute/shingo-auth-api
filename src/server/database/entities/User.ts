import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Role } from './Role'
import { Permission } from './Permission'
import { Exclude, Type } from 'class-transformer'
import {
  IsNumber,
  IsString,
  IsEmail,
  IsBoolean,
  ValidateIf,
  IsOptional,
  IsBase64,
  IsDateString,
  IsEmpty,
} from 'class-validator'

@Entity()
export class User {
  // empty and optional together will mean not defined
  @ValidateIf(o => typeof o.extId === 'undefined', { groups: ['update'] })
  @IsEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['create'] })
  @IsNumber(undefined, { always: true })
  @PrimaryGeneratedColumn()
  id!: number

  @ValidateIf(o => typeof o.id === 'undefined', { groups: ['update'] })
  @IsString({ always: true })
  @Column({ nullable: true, length: '255' })
  extId!: string

  @IsOptional({ groups: ['update'] })
  @IsEmail(undefined, { always: true })
  @Column({ unique: true, length: '255' })
  email!: string

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  @Exclude({ toPlainOnly: true })
  @Column({ length: '255' })
  password!: string

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  @Column({ default: '' })
  services!: string

  @IsOptional({ groups: ['create', 'update'] })
  @IsBoolean({ always: true })
  @Column({ default: true })
  isEnabled!: boolean

  @IsOptional({ groups: ['create', 'update'] })
  @IsBase64({ always: true })
  @Column({ length: '1024', default: '' })
  resetToken!: string

  @IsOptional({ groups: ['create', 'update'] })
  @IsDateString({ always: true })
  @Column({ nullable: true, length: '255' })
  lastLogin!: string

  @Type(() => Role)
  @ManyToMany(_type => Role, role => role.users, { eager: true })
  @JoinTable()
  roles!: Role[]

  @Type(() => Permission)
  @ManyToMany(_type => Permission, permission => permission.users, {
    eager: true,
  })
  @JoinTable()
  permissions!: Permission[]
}
