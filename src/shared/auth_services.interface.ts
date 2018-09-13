import { authservices as M } from './auth_services'
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
import { User, Role, Permission } from '../server/database/entities'
import { RequireKeys } from './util'

// tslint:disable:max-classes-per-file

export class QueryRequest implements Required<M.QueryRequest> {
  @IsString()
  @IsNotEmpty()
  clause: string

  constructor(clause: string | Required<M.QueryRequest>) {
    this.clause = typeof clause === 'string' ? clause : clause.clause
  }
}

export class UserJWT implements Required<M.UserJWT> {
  @IsBase64()
  @IsNotEmpty()
  token: string

  constructor(token: string | Required<M.UserJWT>) {
    this.token = typeof token === 'string' ? token : token.token
  }
}

export class BooleanResponse implements Required<M.BooleanResponse> {
  @IsBoolean()
  response: boolean

  constructor(response: boolean | Required<M.BooleanResponse>) {
    this.response = typeof response === 'boolean' ? response : response.response
  }
}

export class Credentials
  implements RequireKeys<M.Credentials, 'email' | 'password'> {
  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsOptional()
  @IsString()
  services?: string

  constructor(creds: RequireKeys<M.Credentials, 'email' | 'password'>) {
    this.email = creds.email
    this.password = creds.password
    this.services = creds.services
  }
}

export class AccessRequest implements Required<M.AccessRequest> {
  @IsString()
  resource: string

  @IsNumber()
  @IsIn([1, 2])
  level: 1 | 2

  @IsEmail()
  email: string

  @IsString()
  id: string

  constructor(request: Required<M.AccessRequest>) {
    this.resource = request.resource
    this.level = request.level as 1 | 2
    this.email = request.email
    this.id = request.id
  }
}

export class IsValidResponse implements Required<M.IsValidResponse> {
  @IsBoolean()
  valid: boolean

  @ValidateNested()
  token: JWTPayload

  constructor(response: Required<M.IsValidResponse>) {
    this.valid = response.valid
    this.token = response.token as JWTPayload
  }
}

export class JWTPayload implements RequireKeys<M.JWTPayload, 'email'> {
  @IsEmail()
  email: string

  @IsString()
  @IsOptional()
  extId?: string

  constructor(payload: Required<M.JWTPayload>) {
    this.email = payload.email
    this.extId = payload.extId
  }
}

export class GrantRequest implements Required<M.GrantRequest> {
  @IsString()
  @IsNotEmpty()
  resource: string

  @IsNumber()
  level: number

  @IsNumber()
  accessorId: number

  constructor(request: Required<M.GrantRequest>) {
    this.resource = request.resource
    this.level = request.level
    this.accessorId = request.accessorId
  }
}

export class PermissionSet implements Required<M.PermissionSet> {
  @IsNumber()
  permissionId: number

  @IsNumber()
  accessorId: number

  constructor(set: Required<M.PermissionSet>) {
    this.permissionId = set.permissionId
    this.accessorId = set.accessorId
  }
}

export class RoleOperation implements Required<M.RoleOperation> {
  @IsEmail()
  userEmail: string

  @IsNumber()
  roleId: number

  constructor(op: Required<M.RoleOperation>) {
    this.userEmail = op.userEmail
    this.roleId = op.roleId
  }
}

export class UserBatch implements Required<M.UserBatch> {
  @ValidateNested({ each: true })
  users: User[]

  constructor(users: User[] | Required<M.UserBatch>) {
    this.users = Array.isArray(users) ? users : (users.users as User[])
  }
}

export class RoleBatch implements Required<M.RoleBatch> {
  @ValidateNested({ each: true })
  roles: Role[]

  constructor(roles: Role[] | Required<M.RoleBatch>) {
    this.roles = Array.isArray(roles) ? roles : (roles.roles as Role[])
  }
}

export class PermissionBatch implements Required<M.PermissionBatch> {
  @ValidateNested({ each: true })
  permissions: Permission[]

  constructor(roles: Permission[] | Required<M.PermissionBatch>) {
    this.permissions = Array.isArray(roles)
      ? roles
      : (roles.permissions as Permission[])
  }
}

export class LoginAsRequest implements Required<M.LoginAsRequest> {
  @IsNumber()
  adminId: number
  @IsNumber()
  userId: number

  constructor(req: Required<M.LoginAsRequest>) {
    this.adminId = req.adminId
    this.userId = req.userId
  }
}
