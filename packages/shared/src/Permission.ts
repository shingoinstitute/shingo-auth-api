import { Role } from './Role'
import { User } from './User'
import { Type } from 'class-transformer'
import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateIf,
  IsEmpty,
} from 'class-validator'
import { Level } from './auth_services.interface'
import { authservices as M } from './auth_services.proto'
import { OptionalKeys } from './util'

export class Permission
  implements OptionalKeys<Required<M.Permission>, '_TagEmpty'> {
  @IsOptional({ groups: ['create', 'delete'] })
  @IsEmpty({ groups: ['create'] })
  @IsNumber(undefined, { always: true })
  id!: number

  @ValidateIf(o => typeof o.id === 'undefined', { groups: ['delete'] })
  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  resource!: string

  @ValidateIf(o => typeof o.id === 'undefined', { groups: ['delete'] })
  @IsOptional({ groups: ['update'] })
  @IsNumber(undefined, { always: true })
  @IsIn([0, 1, 2], { always: true })
  level!: Level // 0 - deny, 1 - read, 2 - write

  @Type(() => Role)
  roles!: Role[]

  @Type(() => User)
  users!: User[]
}
