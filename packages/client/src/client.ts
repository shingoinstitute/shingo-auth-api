import * as path from 'path'
import { Options as ProtoOptions, loadSync } from '@grpc/proto-loader'
import * as grpc from 'grpc'
import { bindAll, promisifyAll } from './util'
import {
  UserCreateData,
  PermissionCreateData,
  RoleCreateData,
  Level,
  authservices as M,
  RequireKeys,
} from '@shingo/auth-api-shared'
import { PromisifyAll } from './promisify-fix'

const throwOnUndefined = <T>(x: T | undefined): T => {
  if (typeof x === 'undefined') {
    throw new Error('Response is invalid or undefined')
  }
  return x
}

export class AuthClient {
  client: PromisifyAll<M.AuthServiceClient>

  constructor(address: string, creds?: grpc.ChannelCredentials) {
    const protoFile = path.join(__dirname, './proto', 'auth_services.proto')
    const options: ProtoOptions = {
      keepCase: true,
      longs: String,
      enums: String,
    }
    const packageDefinition = loadSync(protoFile, options)
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
      .authservices as grpc.GrpcObject
    const clientClass = protoDescriptor.AuthService as typeof grpc.Client
    this.client = promisifyAll(
      bindAll(new clientClass(
        address,
        creds || grpc.credentials.createInsecure(),
      ) as M.AuthServiceClient),
    )
  }
  // FIXME: All the queries taking clause are open to SQL injection

  /**
   * Get an array of users using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getUsers(clause?: string) {
    return this.client
      .ReadUser({ clause: clause || '' })
      .then(b => b && b.users)
      .then(throwOnUndefined)
  }

  /**
   * Get a single user using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getUser(clause?: string) {
    return this.client
      .ReadOneUser({
        clause: clause || '',
      })
      .then(throwOnUndefined)
  }

  /**
   * Create a user
   * @param user Data to create the user with
   */
  createUser(user: UserCreateData) {
    return this.client.CreateUser(user).then(throwOnUndefined)
  }

  /**
   * Update a user
   * @param user Patch data to overwrite the existing user. Either id or extId is required to identify the user
   */
  updateUser(
    user:
      | RequireKeys<Partial<M.User>, 'id'>
      | RequireKeys<Partial<M.User>, 'extId'>,
  ) {
    return this.client
      .UpdateUser(user)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Delete a user
   * @param user User to delete. Either id or extId is required to identify the user
   */
  deleteUser(
    user:
      | RequireKeys<Partial<M.User>, 'id'>
      | RequireKeys<Partial<M.User>, 'extId'>,
  ) {
    return this.client
      .DeleteUser(user)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Add a role to a user
   * @param set User and role to associate
   */
  addRoleToUser(set: M.RoleOperation) {
    return this.client
      .AddRoleToUser(set)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Remove a role from a user
   * @param set User and role to disassociate
   */
  removeRoleFromUser(set: M.RoleOperation) {
    return this.client
      .RemoveRoleFromUser(set)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Get an array of permissions using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getPermissions(clause?: string) {
    return this.client
      .ReadPermission({ clause: clause || '' })
      .then(r => r && r.permissions)
      .then(throwOnUndefined)
  }

  /**
   * Get a single permission using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getPermission(clause?: string) {
    return this.client
      .ReadOnePermission({
        clause: clause || '',
      })
      .then(throwOnUndefined)
  }

  /**
   * Create a permission
   * @param permission Data to create the permission with
   */
  createPermission(permission: PermissionCreateData) {
    return this.client.CreatePermission(permission).then(throwOnUndefined)
  }

  /**
   * Update a permission
   * @param permission Patch data to overwrite the existing permission. id field is required to identify permission
   */
  updatePermission(permission: RequireKeys<Partial<M.Permission>, 'id'>) {
    return this.client
      .UpdatePermission(permission)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Delete a permission
   * @param obj Permission to delete. id field is required to identify permission
   */
  deletePermission(
    obj: RequireKeys<Partial<M.Permission>, 'id'>,
  ): Promise<boolean>
  /**
   * Delete a permission identified by resource and level
   * @param resource Permission resource
   * @param level Permission level
   */
  deletePermission(resource: string, level: Level): Promise<boolean>
  deletePermission(
    arg1: RequireKeys<Partial<M.Permission>, 'id'> | string,
    arg2?: Level,
  ): Promise<boolean> {
    const obj =
      typeof arg1 === 'string' ? { resource: arg1, level: arg2 } : arg1
    return this.client
      .DeletePermission(obj)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Get an array of roles using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getRoles(clause?: string) {
    return this.client
      .ReadRole({ clause: clause || '' })
      .then(r => r && r.roles)
      .then(throwOnUndefined)
  }

  /**
   * Get a single role using a SQL WHERE clause
   * @param clause A SQL WHERE clause
   */
  getRole(clause?: string) {
    return this.client
      .ReadOneRole({
        clause: clause || '',
      })
      .then(throwOnUndefined)
  }

  /**
   * Create a role
   * @param role Data to create role with
   */
  createRole(role: RoleCreateData) {
    return this.client.CreateRole(role).then(throwOnUndefined)
  }

  /**
   * Update a role
   * @param role Patch data to overwrite the existing role. id field is required to identify role
   */
  updateRole(role: RequireKeys<Partial<M.Role>, 'id'>) {
    return this.client
      .UpdateRole(role)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Delete a role
   * @param role Role to delete. id field is required to identify role
   */
  deleteRole(role: RequireKeys<Partial<M.Role>, 'id'>) {
    return this.client
      .DeleteRole(role)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Login a user
   * @param creds Email and password credentials
   */
  login(creds: { email: string; password: string; services?: string }) {
    return this.client
      .Login(creds)
      .then(r => r && r.token)
      .then(throwOnUndefined)
  }

  /**
   * Check if jwt is valid
   * @param token JWT token
   */
  isValid(token: string) {
    return this.client
      .IsValid({ token })
      .then(r => r && (r.valid ? r.token : r.valid))
      .then(throwOnUndefined)
  }

  /**
   * Check if user with jwt can access the requested resource with given permission level
   * @param resource Resource to grant permissions to
   * @param level Level of access (1=Read, 2=Write)
   * @param jwt JWT token
   */
  canAccess(resource: string, level: 1 | 2, email: string) {
    return this.client
      .CanAccess({ resource, level, email })
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Grant permission to a user
   * @param resource Resource to grant permissions to
   * @param level Level to grant (0=Deny, 1=Read, 2=Write)
   * @param accessorId User Id
   */
  grantPermissionToUser(resource: string, level: Level, accessorId: number) {
    return this.client
      .GrantPermissionToUser({
        resource,
        level,
        accessorId,
      })
      .then(throwOnUndefined)
  }

  /**
   * Grant a permission to a role
   * @param resource Resource to grant permissions to
   * @param level Level to grant (0=Deny, 1=Read, 2=Write)
   * @param accessorId Role Id
   */
  grantPermissionToRole(resource: string, level: Level, accessorId: number) {
    return this.client
      .GrantPermissionToRole({
        resource,
        level,
        accessorId,
      })
      .then(throwOnUndefined)
  }

  /**
   * Revoke permissions for a user
   * @param resource Resource to revoke
   * @param level Level
   * @param accessorId User Id
   */
  revokePermissionFromUser(resource: string, level: Level, accessorId: number) {
    return this.client
      .RevokePermissionFromUser({
        resource,
        level,
        accessorId,
      })
      .then(throwOnUndefined)
  }

  /**
   * Revoke permissions for a role
   * @param resource Resource to revoke
   * @param level Level
   * @param accessorId Role Id
   */
  revokePermissionFromRole(resource: string, level: Level, accessorId: number) {
    return this.client
      .RevokePermissionFromRole({
        resource,
        level,
        accessorId,
      })
      .then(throwOnUndefined)
  }

  /**
   * Log an admin in as a user
   * @param loginReq Login request
   */
  loginAs(loginReq: M.LoginAsRequest) {
    return this.client.LoginAs(loginReq).then(throwOnUndefined)
  }
}
