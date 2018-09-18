import { Permission } from './Permission'
import { User } from './User'
import { Type } from 'class-transformer'
import { IsNumber, IsString, IsOptional, IsEmpty } from 'class-validator'
import { authservices as M } from './auth_services.proto'
import { OptionalKeys } from './util'

export class Role implements OptionalKeys<Required<M.Role>, '_TagEmpty'> {
  @IsOptional({ groups: ['create'] })
  @IsEmpty({ groups: ['create'] })
  @IsNumber(undefined, { always: true })
  id!: number

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  name!: string

  @IsOptional({ groups: ['update'] })
  @IsString({ always: true })
  service!: string

  @Type(() => Permission)
  permissions!: Permission[]

  @Type(() => User)
  users!: User[]
}
