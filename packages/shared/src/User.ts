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
import { authservices as M } from './auth_services.proto'
import { OptionalKeys } from './util'

export class User
  implements
    OptionalKeys<Required<M.User>, 'resetToken' | 'lastLogin' | '_TagEmpty'> {
  // empty and optional together will mean not defined
  @ValidateIf(o => typeof o.extId === 'undefined', { groups: ['update'] })
  @IsEmpty({ groups: ['create'] })
  @IsOptional({ groups: ['create'] })
  @IsNumber(undefined, { always: true })
  id!: number

  @ValidateIf(o => typeof o.id === 'undefined', { groups: ['update'] })
  @IsString({ always: true })
  extId!: string

  @IsOptional({ groups: ['update'] })
  @IsEmail(undefined, { always: true })
  email!: string

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  @Exclude({ toPlainOnly: true })
  password!: string

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  services!: string

  @IsOptional({ groups: ['create', 'update'] })
  @IsBoolean({ always: true })
  isEnabled!: boolean

  @IsOptional({ groups: ['create', 'update'] })
  @IsBase64({ always: true })
  resetToken?: string

  @IsOptional({ groups: ['create', 'update'] })
  @IsDateString({ always: true })
  lastLogin?: string

  @Type(() => Role)
  roles!: Role[]

  @Type(() => Permission)
  permissions!: Permission[]
}
