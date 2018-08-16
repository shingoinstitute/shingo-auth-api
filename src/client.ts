import { ServiceClient } from './server/microservices/auth.microservice'
import * as path from 'path'
import { Options as ProtoOptions, loadSync } from '@grpc/proto-loader'
import * as grpc from 'grpc'
import { bindAll, RequireKeys } from './shared/util'
import * as M from './shared/messages'
import { promisify } from 'util'
import { UserCreateData } from './server/user.service'
import { PermissionCreateData } from './server/permission.service'
import { Level } from './server/database/entities/Permission'
import { RoleCreateData } from './server/role.service'

const throwOnUndefined = <T>(x: T | undefined): T => {
  if (typeof x === 'undefined') {
    throw new Error('Response is undefined')
  }
  return x
}

export class AuthClient {
  client: ServiceClient

  constructor(address: string, creds?: grpc.ChannelCredentials) {
    const protoFile = path.join(__dirname, './proto', 'auth_services.proto')
    const options: ProtoOptions = {
      keepCase: true,
      longs: String,
      enums: String,
    }
    const packageDefinition = loadSync(protoFile, options)
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).authservices as grpc.GrpcObject
    const clientClass = protoDescriptor.AuthService as typeof grpc.Client
    this.client = bindAll(new clientClass(address, creds || grpc.credentials.createInsecure()) as ServiceClient)
  }
  // FIXME: All the queries taking clause are open to SQL injection

  /**
   * Get an array of users using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getUsers(clause?: string): Promise<M.User[]> {
    return promisify(this.client.readUser)({ clause: clause || '' })
      .then(throwOnUndefined)
      .then(b => b.users)
  }

  /**
   * Get a single user using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getUser(clause?: string): Promise<M.User> {
    return promisify(this.client.readOneUser)({ clause: clause || '' })
      .then(throwOnUndefined)
  }

  /**
   * Create a user
   * @param user Data to create the user with
   */
  createUser(user: UserCreateData): Promise<M.User> {
    return promisify(this.client.createUser)(user)
      .then(throwOnUndefined)
  }

  /**
   * Update a user
   * @param user Patch data to overwrite the existing user. Either id or extId is required to identify the user
   */
  updateUser(user: RequireKeys<Partial<M.User>, 'id'> | RequireKeys<Partial<M.User>, 'extId'>): Promise<boolean> {
    return promisify(this.client.updateUser)(user)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Delete a user
   * @param user User to delete. Either id or extId is required to identify the user
   */
  deleteUser(user: RequireKeys<Partial<M.User>, 'id'> | RequireKeys<Partial<M.User>, 'extId'>): Promise<boolean> {
    return promisify(this.client.deleteUser)(user)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Add a role to a user
   * @param set User and role to associate
   */
  addRoleToUser(set: M.RoleOperation): Promise<boolean> {
    return promisify(this.client.addRoleToUser)(set)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Remove a role from a user
   * @param set User and role to disassociate
   */
  removeRoleFromUser(set: M.RoleOperation): Promise<boolean> {
    return promisify(this.client.removeRoleFromUser)(set)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Get an array of permissions using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getPermissions(clause?: string): Promise<M.Permission[]> {
    return promisify(this.client.readPermission)({ clause: clause || '' })
      .then(throwOnUndefined)
      .then(r => r.permissions)
  }

  /**
   * Get a single permission using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getPermission(clause?: string): Promise<M.Permission> {
    return promisify(this.client.readOnePermission)({ clause: clause || '' })
      .then(throwOnUndefined)
  }

  /**
   * Create a permission
   * @param permission Data to create the permission with
   */
  createPermission(permission: PermissionCreateData): Promise<M.Permission> {
    return promisify(this.client.createPermission)(permission)
      .then(throwOnUndefined)
  }

  /**
   * Update a permission
   * @param permission Patch data to overwrite the existing permission. id field is required to identify permission
   */
  updatePermission(permission: RequireKeys<Partial<M.Permission>, 'id'>): Promise<boolean> {
    return promisify(this.client.updatePermission)(permission)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Delete a permission
   * @param obj Permission to delete. id field is required to identify permission
   */
  deletePermission(obj: RequireKeys<Partial<M.Permission>, 'id'>): Promise<boolean>
  /**
   * Delete a permission identified by resource and level
   * @param resource Permission resource
   * @param level Permission level
   */
  deletePermission(resource: string, level: Level): Promise<boolean>
  deletePermission(arg1: RequireKeys<Partial<M.Permission>, 'id'> | string, arg2?: Level): Promise<boolean> {
    const obj = typeof arg1 === 'string' ? { resource: arg1, level: arg2 } : arg1
    return promisify(this.client.deletePermission)(obj)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Get an array of roles using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getRoles(clause?: string): Promise<M.Role[]> {
    return promisify(this.client.readRole)({ clause: clause || '' })
      .then(throwOnUndefined)
      .then(r => r.roles)
  }

  /**
   * Get a single role using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getRole(clause?: string): Promise<M.Role> {
    return promisify(this.client.readOneRole)({ clause: clause || '' })
      .then(throwOnUndefined)
  }

  /**
   * Create a role
   * @param role Data to create role with
   */
  createRole(role: RoleCreateData): Promise<M.Role> {
    return promisify(this.client.createRole)(role)
      .then(throwOnUndefined)
  }

  /**
   * Update a role
   * @param role Patch data to overwrite the existing role. id field is required to identify role
   */
  updateRole(role: RequireKeys<Partial<M.Role>, 'id'>): Promise<boolean> {
    return promisify(this.client.updateRole)(role)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Delete a role
   * @param role Role to delete. id field is required to identify role
   */
  deleteRole(role: RequireKeys<Partial<M.Role>, 'id'>): Promise<boolean> {
    return promisify(this.client.deleteRole)(role)
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Login a user
   * @param creds Email and password credentials
   */
  login(creds: { email: string, password: string, services?: string }): Promise<M.User> {
    return promisify(this.client.login)(creds)
      .then(throwOnUndefined)
  }

  /**
   * Check if jwt is valid
   * @param token JWT token
   */
  isValid(token: string): Promise<boolean> {
    return promisify(this.client.isValid)({ token })
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Check if user with jwt can access the requested resource with given permission level
   * @param resource Resource to grant permissions to
   * @param level Level of access (1=Read, 2=Write)
   * @param jwt JWT token
   */
  canAccess(resource: string, level: 1 | 2, jwt: string): Promise<boolean> {
    return promisify(this.client.canAccess)({ resource, level, jwt })
      .then(throwOnUndefined)
      .then(r => r.response)
  }

  /**
   * Grant permission to a user
   * @param resource Resource to grant permissions to
   * @param level Level to grant (0=Deny, 1=Read, 2=Write)
   * @param accessorId User Id
   */
  grantPermissionToUser(resource: string, level: Level, accessorId: number): Promise<M.PermissionSet> {
    return promisify(this.client.grantPermissionToUser)({ resource, level, accessorId })
      .then(throwOnUndefined)
  }

  /**
   * Grant a permission to a role
   * @param resource Resource to grant permissions to
   * @param level Level to grant (0=Deny, 1=Read, 2=Write)
   * @param accessorId Role Id
   */
  grantPermissionToRole(resource: string, level: Level, accessorId: number): Promise<M.PermissionSet> {
    return promisify(this.client.grantPermissionToRole)({ resource, level, accessorId })
      .then(throwOnUndefined)
  }

  /**
   * Revoke permissions for a user
   * @param resource Resource to revoke
   * @param level Level
   * @param accessorId User Id
   */
  revokePermissionFromUser(resource: string, level: Level, accessorId: number): Promise<M.PermissionSet> {
    return promisify(this.client.revokePermissionFromUser)({ resource, level, accessorId })
      .then(throwOnUndefined)
  }

  /**
   * Revoke permissions for a role
   * @param resource Resource to revoke
   * @param level Level
   * @param accessorId Role Id
   */
  revokePermissionFromRole(resource: string, level: Level, accessorId: number): Promise<M.PermissionSet> {
    return promisify(this.client.revokePermissionFromRole)({ resource, level, accessorId })
      .then(throwOnUndefined)
  }

  /**
   * Log an admin in as a user
   * @param loginReq Login request
   */
  loginAs(loginReq: M.LoginAsRequest): Promise<M.User> {
    return promisify(this.client.loginAs)(loginReq)
      .then(throwOnUndefined)
  }
}
