import * as path from 'path'
import { Options as ProtoOptions, loadSync } from '@grpc/proto-loader'
import * as grpc from 'grpc'
import { bindAll, promisifyAll, parseError, parseEmpty } from './util'
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

export {
  UserCreateData,
  PermissionCreateData,
  RoleCreateData,
  Level,
  M as authservices,
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
      .catch(parseError)
      .then(b => b && (b.users || []))
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
      .catch(parseError)
      .then(parseEmpty)
  }

  getUserOrFail(clause?: string) {
    return this.getUser(clause).then(throwOnUndefined)
  }

  /**
   * Create a user
   * @param user Data to create the user with
   */
  createUser(user: UserCreateData) {
    return this.client
      .CreateUser(user)
      .catch(parseError)
      .then(throwOnUndefined)
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
      .catch(parseError)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Delete a user
   * @param user User to delete. Either id or extId is required to identify the user
   */
  deleteUser(user: RequireKeys<M.User, 'id'> | RequireKeys<M.User, 'extId'>) {
    return this.client
      .DeleteUser(user)
      .catch(parseError)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Add a role to a user
   * @param set User and role to associate
   */
  addRoleToUser(set: Required<M.RoleOperation>) {
    return this.client
      .AddRoleToUser(set)
      .catch(parseError)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Remove a role from a user
   * @param set User and role to disassociate
   */
  removeRoleFromUser(set: Required<M.RoleOperation>) {
    return this.client
      .RemoveRoleFromUser(set)
      .catch(parseError)
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
      .catch(parseError)
      .then(r => r && (r.permissions || [])) // grpc removes empty arrays and other empty responses, which is stupid and super annoying
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
      .catch(parseError)
      .then(parseEmpty) // grpc/protobuf has no concept of undefined or optional, so we have to tag an object with __tag_empty: true when sending undefined
  }

  getPermissionOrFail(clause?: string) {
    return this.getPermission(clause).then(throwOnUndefined)
  }

  /**
   * Create a permission
   * @param permission Data to create the permission with
   */
  createPermission(permission: PermissionCreateData) {
    return this.client
      .CreatePermission(permission)
      .catch(parseError)
      .then(throwOnUndefined)
  }

  /**
   * Update a permission
   * @param permission Patch data to overwrite the existing permission. id field is required to identify permission
   */
  updatePermission(permission: RequireKeys<M.Permission, 'id'>) {
    return this.client
      .UpdatePermission(permission)
      .catch(parseError)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Delete a permission
   * @param obj Permission to delete. id field is required to identify permission
   */
  deletePermission(obj: RequireKeys<M.Permission, 'id'>): Promise<boolean>
  /**
   * Delete a permission identified by resource and level
   * @param resource Permission resource
   * @param level Permission level
   */
  deletePermission(resource: string, level: Level): Promise<boolean>
  deletePermission(
    arg1: RequireKeys<M.Permission, 'id'> | string,
    arg2?: Level,
  ): Promise<boolean> {
    const obj =
      typeof arg1 === 'string' ? { resource: arg1, level: arg2 } : arg1
    return this.client
      .DeletePermission(obj)
      .catch(parseError)
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
      .catch(parseError)
      .then(r => r && (r.roles || []))
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
      .catch(parseError)
      .then(parseEmpty)
  }

  getRoleOrFail(clause?: string) {
    return this.getRole(clause).then(throwOnUndefined)
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
  updateRole(role: RequireKeys<M.Role, 'id'>) {
    return this.client
      .UpdateRole(role)
      .catch(parseError)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Delete a role
   * @param role Role to delete. id field is required to identify role
   */
  deleteRole(role: RequireKeys<M.Role, 'id'>) {
    return this.client
      .DeleteRole(role)
      .catch(parseError)
      .then(r => r && r.response)
      .then(throwOnUndefined)
  }

  /**
   * Login a user
   * @param creds Email and password credentials
   */
  login(creds: RequireKeys<M.Credentials, 'email' | 'password'>) {
    return this.client
      .Login(creds)
      .catch(parseError)
      .then(r => r && r.value)
      .then(throwOnUndefined)
  }

  /**
   * Check if jwt is valid
   * @param token JWT token
   */
  isValid(value: string) {
    return this.client
      .IsValid({ value })
      .catch(parseError)
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
      .catch(parseError)
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
      .catch(parseError)
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
      .catch(parseError)
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
      .catch(parseError)
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
      .catch(parseError)
      .then(throwOnUndefined)
  }

  /**
   * Log an admin in as a user
   * @param loginReq Login request
   */
  loginAs(loginReq: Required<M.LoginAsRequest>) {
    return this.client
      .LoginAs(loginReq)
      .catch(parseError)
      .then(r => r && r.value)
      .then(throwOnUndefined)
  }

  generateResetToken(email: string) {
    return this.client
      .GenerateResetToken({ value: email })
      .catch(parseError)
      .then(r => {
        if (r && r.value && r.hasValue) {
          return r.value
        }
      })
      .then(throwOnUndefined)
  }

  resetPassword(token: string, password: string) {
    return this.client.ResetPassword({ token, password }).then(r => {
      if (r && r.value && r.hasValue) {
        return r.value
      }
    })
  }
}
