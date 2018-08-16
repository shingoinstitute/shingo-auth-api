// these MUST match the message definitions in auth_services.proto
// Ideally this file would be generated as part of a build step
export interface QueryRequest {
  clause: string
}

export interface UserJWT {
  token: string
}

export interface BooleanResponse {
  response: boolean
}

export interface Credentials {
  email: string
  password: string
  services: string
}

export interface User {
  id: number
  email: string
  jwt: string
  services: string
  permissions: Permission[]
  roles: Role[]
  isEnabled: boolean
  password: string
  extId: string
  resetToken: string
  lastLogin: string
}

export interface AccessRequest {
  resource: string
  level: 1 | 2
  jwt: string
  id: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
  service: string
  users: User[]
}

export interface Permission {
  id: number
  resource: string
  level: number
  roles: Role[]
  users: User[]
}

export interface GrantRequest {
  resource: string
  level: number
  accessorId: number
}

export interface PermissionSet {
  permissionId: number
  accessorId: number
}

export interface RoleOperation {
  userEmail: string
  roleId: number
}

export interface UserBatch {
  users: User[]
}

export interface RoleBatch {
  roles: Role[]
}

export interface PermissionBatch {
  permissions: Permission[]
}

export interface LoginAsRequest {
  adminId: number
  userId: number
}
