import { loggerFactory } from '../../shared/logger.service'
import * as grpc from 'grpc'
import * as path from 'path'
import { UserService, PermissionService, RoleService, AuthService } from '../index'
import * as M from '../../shared/messages'
import { Options as ProtoOptions, loadSync } from '@grpc/proto-loader'
import { Service } from 'typedi'
import { handleUnary, undefinedToNull } from '../../shared/util'
import { classToPlain } from 'class-transformer'

const log = loggerFactory()

export interface ServiceImplementation {
  createUser: grpc.handleUnaryCall<M.User, M.User>
  readUser: grpc.handleUnaryCall<M.QueryRequest, M.UserBatch>
  readOneUser: grpc.handleUnaryCall<M.QueryRequest, M.User>
  updateUser: grpc.handleUnaryCall<M.User, M.BooleanResponse>
  deleteUser: grpc.handleUnaryCall<M.User, M.BooleanResponse>
  addRoleToUser: grpc.handleUnaryCall<M.RoleOperation, M.BooleanResponse>
  removeRoleFromUser: grpc.handleUnaryCall<M.RoleOperation, M.BooleanResponse>
  createPermission: grpc.handleUnaryCall<M.Permission, M.Permission>
  readPermission: grpc.handleUnaryCall<M.QueryRequest, M.PermissionBatch>
  readOnePermission: grpc.handleUnaryCall<M.QueryRequest, M.Permission>
  updatePermission: grpc.handleUnaryCall<M.Permission, M.BooleanResponse>
  deletePermission: grpc.handleUnaryCall<M.Permission, M.BooleanResponse>
  createRole: grpc.handleUnaryCall<M.Role, M.Role>
  readRole: grpc.handleUnaryCall<M.QueryRequest, M.RoleBatch>
  readOneRole: grpc.handleUnaryCall<M.QueryRequest, M.Role>
  updateRole: grpc.handleUnaryCall<M.Role, M.BooleanResponse>
  deleteRole: grpc.handleUnaryCall<M.Role, M.BooleanResponse>
  login: grpc.handleUnaryCall<M.Credentials, M.UserJWT>
  isValid: grpc.handleUnaryCall<M.UserJWT, M.IsValidResponse>
  canAccess: grpc.handleUnaryCall<M.AccessRequest, M.BooleanResponse>
  grantPermissionToUser: grpc.handleUnaryCall<M.GrantRequest, M.PermissionSet>
  grantPermissionToRole: grpc.handleUnaryCall<M.GrantRequest, M.PermissionSet>
  revokePermissionFromUser: grpc.handleUnaryCall<M.GrantRequest, M.PermissionSet>
  revokePermissionFromRole: grpc.handleUnaryCall<M.GrantRequest, M.PermissionSet>
  loginAs: grpc.handleUnaryCall<M.LoginAsRequest, M.User>
}

export interface ServiceClient extends grpc.Client {
  createUser(req: Partial<M.User>, cb: grpc.requestCallback<M.User>): void
  readUser(req: Partial<M.QueryRequest>, cb: grpc.requestCallback<M.UserBatch>): void
  readOneUser(req: Partial<M.QueryRequest>, cb: grpc.requestCallback<M.User>): void
  updateUser(req: Partial<M.User>, cb: grpc.requestCallback<M.BooleanResponse>): void
  deleteUser(req: Partial<M.User>, cb: grpc.requestCallback<M.BooleanResponse>): void
  addRoleToUser(req: Partial<M.RoleOperation>, cb: grpc.requestCallback<M.BooleanResponse>): void
  removeRoleFromUser(req: Partial<M.RoleOperation>, cb: grpc.requestCallback<M.BooleanResponse>): void
  createPermission(req: Partial<M.Permission>, cb: grpc.requestCallback<M.Permission>): void
  readPermission(req: Partial<M.QueryRequest>, cb: grpc.requestCallback<M.PermissionBatch>): void
  readOnePermission(req: Partial<M.QueryRequest>, cb: grpc.requestCallback<M.Permission>): void
  updatePermission(req: Partial<M.Permission>, cb: grpc.requestCallback<M.BooleanResponse>): void
  deletePermission(req: Partial<M.Permission>, cb: grpc.requestCallback<M.BooleanResponse>): void
  createRole(req: Partial<M.Role>, cb: grpc.requestCallback<M.Role>): void
  readRole(req: Partial<M.QueryRequest>, cb: grpc.requestCallback<M.RoleBatch>): void
  readOneRole(req: Partial<M.QueryRequest>, cb: grpc.requestCallback<M.Role>): void
  updateRole(req: Partial<M.Role>, cb: grpc.requestCallback<M.BooleanResponse>): void
  deleteRole(req: Partial<M.Role>, cb: grpc.requestCallback<M.BooleanResponse>): void
  login(req: Partial<M.Credentials>, cb: grpc.requestCallback<M.UserJWT>): void
  isValid(req: Partial<M.UserJWT>, cb: grpc.requestCallback<M.IsValidResponse>): void
  canAccess(req: Partial<M.AccessRequest>, cb: grpc.requestCallback<M.BooleanResponse>): void
  grantPermissionToUser(req: Partial<M.GrantRequest>, cb: grpc.requestCallback<M.PermissionSet>): void
  grantPermissionToRole(req: Partial<M.GrantRequest>, cb: grpc.requestCallback<M.PermissionSet>): void
  revokePermissionFromUser(req: Partial<M.GrantRequest>, cb: grpc.requestCallback<M.PermissionSet>): void
  revokePermissionFromRole(req: Partial<M.GrantRequest>, cb: grpc.requestCallback<M.PermissionSet>): void
  loginAs(req: Partial<M.LoginAsRequest>, cb: grpc.requestCallback<M.User>): void
}

const makeUnaryCall = handleUnary(log)

@Service()
export class AuthMicroservice implements ServiceImplementation {

    service: grpc.ServiceDefinition<ServiceImplementation>

    constructor(private userService: UserService,
                private permissionService: PermissionService,
                private roleService: RoleService,
                private authService: AuthService) {
      const protoFile = path.join(__dirname, '../../proto', 'auth_services.proto')
      const options: ProtoOptions = {
        keepCase: true,
        longs: String,
        enums: String,
      }
      const packageDefinition = loadSync(protoFile, options)
      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).authservices as grpc.GrpcObject
      this.service = (protoDescriptor.AuthService as any).service
    }

    /****************
     * UserServices *
     ***************/

    // Create a new user
    createUser = makeUnaryCall('createUser', (req: M.User) => this.userService.create(req) as Promise<M.User>)

    // Get a list of users based on a TypeORM query
    readUser = makeUnaryCall('readUser', (req: M.QueryRequest) =>
      this.userService.read(req.clause).then(users => ({ users: classToPlain(users) as M.User[] }))
    )

    // Get a single user based on a TypeORM query
    readOneUser = makeUnaryCall('readOneUser', (req: M.QueryRequest) =>
      this.userService.readOne(req.clause).then(c => c && (classToPlain(c) as M.User)).then(undefinedToNull)
    )

    // Update a user (requires user.id)
    updateUser = makeUnaryCall('updateUser', (req: M.User) =>
      this.userService.update(req).then(response => ({ response }))
    )

    // Delete a user (requires user.id)
    deleteUser = makeUnaryCall('deleteUser', (req: M.User) =>
      this.userService.delete(req).then(response => ({ response }))
    )

    // Add a role to a user (requires userId and roleId)
    addRoleToUser = makeUnaryCall('addRoleToUser', (req: M.RoleOperation) =>
      this.userService.addRole(req).then(response => ({ response }))
    )

    // Remove a role from a user (requires userId and roleId)
    removeRoleFromUser = makeUnaryCall('removeRoleFromUser', (req: M.RoleOperation) =>
      this.userService.removeRole(req).then(response => ({ response }))
    )

    /**********************
     * PermissionServices *
     *********************/

    // Create a new permission
    createPermission = makeUnaryCall('createPermission', (req: M.Permission) =>
      this.permissionService.create(req).then(v => classToPlain(v) as M.Permission)
    )

    // Get a list of permissions based on a TypeORM query
    readPermission = makeUnaryCall('readPermission', (req: M.QueryRequest) =>
        this.permissionService.read(req.clause).then(p => ({ permissions: classToPlain(p) as M.Permission[] }))
    )

    // Get a single permission based on a TypeORM query
    readOnePermission = makeUnaryCall('readOnePermission', (req: M.QueryRequest) =>
      this.permissionService.readOne(req.clause).then(p => p && (classToPlain(p) as M.Permission)).then(undefinedToNull)
    )

    // Update a permission (requires permission.id)
    updatePermission = makeUnaryCall('updatePermission', (req: M.Permission) =>
      this.permissionService.update(req).then(response => ({ response }))
    )

    // Delete a permission (requires permission.id)
    deletePermission = makeUnaryCall('deletePermission', (req: M.Permission) =>
      this.permissionService.delete(req).then(response => ({ response }))
    )

    /****************
     * RoleServices *
     ***************/
    // Create a new Role
    createRole = makeUnaryCall('createRole', (req: M.Role) =>
      this.roleService.create(req)
    )

    // Get a list of roles based on a TypeORM query
    readRole = makeUnaryCall('readRole', (req: M.QueryRequest) =>
      this.roleService.read(req.clause).then(rs => ({ roles: classToPlain(rs) as M.Role[] }))
    )

    // Get a single role based on a TypeORM query
    readOneRole = makeUnaryCall('readOneRole', (req: M.QueryRequest) =>
      this.roleService.readOne(req.clause).then(r => r && (classToPlain(r) as M.Role)).then(undefinedToNull)
    )

    // Update a role (requires role.id)
    updateRole = makeUnaryCall('updateRole', (req: M.Role) =>
      this.roleService.update(req).then(response => ({ response }))
    )

    // Delete a role (requires role.id)
    deleteRole = makeUnaryCall('deleteRole', (req: M.Role) =>
      this.roleService.delete(req).then(response => ({ response }))
    )

    /****************
     * AuthServices *
     ***************/
    // Login a user based on email and password
    login = makeUnaryCall('login', (req: M.Credentials) =>
      this.authService.login(req).then(token => ({ token }))
    )

    // Checks if JSON Web Token is valid
    isValid = makeUnaryCall('isValid', (req: M.UserJWT) =>
      this.authService.isValid(req.token).then(token =>
        !token
          ? { valid: false as false }
          : { valid: true as true, token }
        )
    )

    // Checks if user (via JWT) has permissions for resource at requested level
    canAccess = makeUnaryCall('canAccess', (req: M.AccessRequest) =>
      this.authService.canAccess(req).then(response => ({ response }))
    )

    // Grants permission to a user
    grantPermissionToUser = makeUnaryCall('grantPermissionToUser', (req: M.GrantRequest) =>
      this.authService.grantToUser(req)
    )

    // Grants permission to a role
    grantPermissionToRole = makeUnaryCall('grantPermissionToRole', (req: M.GrantRequest) =>
      this.authService.grantToRole(req)
    )

    // Revokes permission from a user
    revokePermissionFromUser = makeUnaryCall('revokePermissionFromUser', (req: M.GrantRequest) =>
      this.authService.revokeFromUser(req)
    )

    // Revokes permission from a role
    revokePermissionFromRole = makeUnaryCall('revokePermissionFromRole', (req: M.GrantRequest) =>
      this.authService.revokeFromRole(req)
    )

    loginAs = makeUnaryCall('loginAs', (req: M.LoginAsRequest) =>
      this.authService.loginAs(req).then(u => classToPlain(u) as M.User)
    )
}
