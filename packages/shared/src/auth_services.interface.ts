import { authservices as M } from './auth_services.proto'
import {
  IsString,
  IsNotEmpty,
  IsBase64,
  IsBoolean,
  IsNumber,
  IsEmail,
  ValidateNested,
  IsOptional,
  IsIn,
} from 'class-validator'
import { User, Role, Permission } from '.'
import { RequireKeys } from './util'
import { Type } from 'class-transformer'

// tslint:disable:max-classes-per-file

// We have undefined checks in all of the constructors because class-transformer does not use the constructor
// but we want any human consumer to provide a construction object

export interface PermissionCreateData {
  resource: string
  level: Level
}

export interface RoleCreateData {
  name: string
  service: string
}

export interface UserCreateData {
  email: string
  password: string
  services: string
  extId: string
}

export const enum Level {
  Deny = 0,
  Read = 1,
  Write = 2,
}

export class QueryRequest implements Required<M.QueryRequest> {
  @IsString()
  clause!: string

  constructor(clause: string | Required<M.QueryRequest>) {
    if (typeof clause !== 'undefined') {
      this.clause = typeof clause === 'string' ? clause : clause.clause
    }
  }
}

export class StringValue implements Required<M.StringValue> {
  @IsString()
  @IsNotEmpty()
  value!: string

  constructor(token: string | Required<M.StringValue>) {
    if (typeof token !== 'undefined') {
      this.value = typeof token === 'string' ? token : token.value
    }
  }
}

export class ResetParams implements Required<M.ResetParams> {
  @IsString()
  @IsNotEmpty()
  token!: string

  @IsString()
  @IsNotEmpty()
  password!: string

  constructor(params: Required<M.ResetParams>) {
    if (params) {
      this.token = params.token
      this.password = params.password
    }
  }
}

export class BooleanResponse implements Required<M.BooleanResponse> {
  @IsBoolean()
  response!: boolean

  constructor(response: boolean | Required<M.BooleanResponse>) {
    if (typeof response !== 'undefined') {
      this.response =
        typeof response === 'boolean' ? response : response.response
    }
  }
}

export class Credentials
  implements RequireKeys<M.Credentials, 'email' | 'password'> {
  @IsEmail()
  email!: string

  @IsString()
  password!: string

  @IsOptional()
  @IsString()
  services?: string

  constructor(creds: RequireKeys<M.Credentials, 'email' | 'password'>) {
    if (typeof creds !== 'undefined') {
      this.email = creds.email
      this.password = creds.password
      this.services = creds.services
    }
  }
}

export class AccessRequest implements Required<M.AccessRequest> {
  @IsString()
  resource!: string

  @IsNumber()
  @IsIn([1, 2])
  level!: 1 | 2

  @IsEmail()
  email!: string

  @IsString()
  id!: string

  constructor(request: Required<M.AccessRequest>) {
    if (typeof request !== 'undefined') {
      this.resource = request.resource
      this.level = request.level as 1 | 2
      this.email = request.email
      this.id = request.id
    }
  }
}

export class JWTPayload implements RequireKeys<M.JWTPayload, 'email'> {
  @IsEmail()
  email!: string

  @IsString()
  @IsOptional()
  extId?: string

  constructor(payload: Required<M.JWTPayload>) {
    if (typeof payload !== 'undefined') {
      this.email = payload.email
      this.extId = payload.extId
    }
  }
}

export class IsValidResponse implements Required<M.IsValidResponse> {
  @IsBoolean()
  valid!: boolean

  @ValidateNested()
  @Type(() => JWTPayload)
  token!: JWTPayload

  constructor(response: Required<M.IsValidResponse>) {
    if (typeof response !== 'undefined') {
      this.valid = response.valid
      this.token = response.token as JWTPayload
    }
  }
}

export class GrantRequest implements Required<M.GrantRequest> {
  @IsString()
  @IsNotEmpty()
  resource!: string

  @IsNumber()
  level!: number

  @IsNumber()
  accessorId!: number

  constructor(request: Required<M.GrantRequest>) {
    if (typeof request !== 'undefined') {
      this.resource = request.resource
      this.level = request.level
      this.accessorId = request.accessorId
    }
  }
}

export class PermissionSet implements Required<M.PermissionSet> {
  @IsNumber()
  permissionId!: number

  @IsNumber()
  accessorId!: number

  constructor(set: Required<M.PermissionSet>) {
    if (typeof set !== 'undefined') {
      this.permissionId = set.permissionId
      this.accessorId = set.accessorId
    }
  }
}

export class RoleOperation implements Required<M.RoleOperation> {
  @IsEmail()
  userEmail!: string

  @IsNumber()
  roleId!: number

  constructor(op: Required<M.RoleOperation>) {
    if (typeof op !== 'undefined') {
      this.userEmail = op.userEmail
      this.roleId = op.roleId
    }
  }
}

export class UserBatch implements Required<M.UserBatch> {
  @ValidateNested({ each: true })
  @Type(() => User)
  users!: User[]

  constructor(users: User[] | Required<M.UserBatch>) {
    if (typeof users !== 'undefined') {
      this.users = Array.isArray(users) ? users : (users.users as User[])
    }
  }
}

export class RoleBatch implements Required<M.RoleBatch> {
  @ValidateNested({ each: true })
  @Type(() => Role)
  roles!: Role[]

  constructor(roles: Role[] | Required<M.RoleBatch>) {
    if (typeof roles !== 'undefined') {
      this.roles = Array.isArray(roles) ? roles : (roles.roles as Role[])
    }
  }
}

export class PermissionBatch implements Required<M.PermissionBatch> {
  @ValidateNested({ each: true })
  @Type(() => Permission)
  permissions!: Permission[]

  constructor(roles: Permission[] | Required<M.PermissionBatch>) {
    if (typeof roles !== 'undefined') {
      this.permissions = Array.isArray(roles)
        ? roles
        : (roles.permissions as Permission[])
    }
  }
}

export class LoginAsRequest implements Required<M.LoginAsRequest> {
  @IsNumber()
  adminId!: number
  @IsNumber()
  userId!: number

  constructor(req: Required<M.LoginAsRequest>) {
    if (typeof req !== 'undefined') {
      this.adminId = req.adminId
      this.userId = req.userId
    }
  }
}
