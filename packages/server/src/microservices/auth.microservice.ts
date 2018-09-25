import { loggerFactory } from '../logger.factory'
import * as grpc from 'grpc'
import * as path from 'path'
import {
  UserService,
  PermissionService,
  RoleService,
  AuthService,
} from '../index'
import { Options as ProtoOptions, loadSync } from '@grpc/proto-loader'
import { Service } from 'typedi'
import { handleUnary, undefinedToEmpty } from '../util'
import { pipe } from '../fp'
import { User, Permission, Role } from '../database/entities'
import {
  QueryRequest,
  RoleOperation,
  Credentials,
  StringValue,
  AccessRequest,
  GrantRequest,
  LoginAsRequest,
  authservices as M,
  validateInput,
  classToPlain,
  ResetParams,
} from '@shingo/auth-api-shared'

// tslint:disable:variable-name no-shadowed-variable

const log = loggerFactory()
const makeUnaryCall = handleUnary(log)

@Service()
export class AuthMicroservice implements M.AuthServiceImplementation {
  service: grpc.ServiceDefinition<M.AuthServiceImplementation>

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private roleService: RoleService,
    private authService: AuthService,
  ) {
    const protoFile = path.join(__dirname, '../proto', 'auth_services.proto')
    const options: ProtoOptions = {
      keepCase: true,
      longs: String,
      enums: String,
    }
    const packageDefinition = loadSync(protoFile, options)
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
      .authservices as grpc.GrpcObject
    this.service = (protoDescriptor.AuthService as any).service
  }

  /****************
   * UserServices *
   ***************/

  // Create a new user
  CreateUser = makeUnaryCall(
    'createUser',
    pipe(
      validateInput(User, { groups: ['create'] }),
      req => req.then(u => this.userService.create(u)),
    ),
  )

  // Get a list of users based on a TypeORM query
  ReadUser = makeUnaryCall(
    'readUser',
    pipe(
      validateInput(QueryRequest),
      req =>
        req.then(({ clause }) =>
          this.userService
            .read(clause)
            .then(users => ({ users: classToPlain(users) as User[] })),
        ),
    ),
  )

  // Get a single user based on a TypeORM query
  ReadOneUser = makeUnaryCall(
    'readOneUser',
    pipe(
      validateInput(QueryRequest),
      req =>
        req.then(({ clause }) =>
          this.userService
            .readOne(clause)
            .then(c => c && (classToPlain(c) as M.User))
            .then(undefinedToEmpty),
        ),
    ),
  )

  // Update a user (requires user.id)
  UpdateUser = makeUnaryCall(
    'updateUser',
    pipe(
      validateInput(User, { groups: ['update'] }),
      req =>
        req.then(u =>
          this.userService.update(u).then(response => ({ response })),
        ),
    ),
  )

  // Delete a user (requires user.id)
  DeleteUser = makeUnaryCall(
    'deleteUser',
    pipe(
      validateInput(User, { groups: ['update'] }),
      req =>
        req.then(u =>
          this.userService.delete(u).then(response => ({ response })),
        ),
    ),
  )

  // Add a role to a user (requires userId and roleId)
  AddRoleToUser = makeUnaryCall(
    'addRoleToUser',
    pipe(
      validateInput(RoleOperation),
      req =>
        req.then(op =>
          this.userService.addRole(op).then(response => ({ response })),
        ),
    ),
  )

  // Remove a role from a user (requires userId and roleId)
  RemoveRoleFromUser = makeUnaryCall(
    'removeRoleFromUser',
    pipe(
      validateInput(RoleOperation),
      req =>
        req.then(op =>
          this.userService.removeRole(op).then(response => ({ response })),
        ),
    ),
  )

  /**********************
   * PermissionServices *
   *********************/

  // Create a new permission
  CreatePermission = makeUnaryCall(
    'createPermission',
    pipe(
      validateInput(Permission, { groups: ['create'] }),
      req =>
        req.then(perm =>
          this.permissionService
            .readOrCreate(perm)
            .then(v => classToPlain(v) as M.Permission),
        ),
    ),
  )

  // Get a list of permissions based on a TypeORM query
  ReadPermission = makeUnaryCall(
    'readPermission',
    pipe(
      validateInput(QueryRequest),
      req =>
        req.then(({ clause }) =>
          this.permissionService
            .read(clause)
            .then(p => ({ permissions: classToPlain(p) as M.Permission[] })),
        ),
    ),
  )

  // Get a single permission based on a TypeORM query
  ReadOnePermission = makeUnaryCall(
    'readOnePermission',
    pipe(
      validateInput(QueryRequest),
      req =>
        req.then(({ clause }) =>
          this.permissionService
            .readOne(clause)
            .then(p => p && (classToPlain(p) as M.Permission))
            .then(undefinedToEmpty),
        ),
    ),
  )

  // Update a permission (requires permission.id)
  UpdatePermission = makeUnaryCall(
    'updatePermission',
    pipe(
      validateInput(Permission, { groups: ['update'] }),
      req =>
        req.then(p =>
          this.permissionService.update(p).then(response => ({ response })),
        ),
    ),
  )

  // Delete a permission (requires permission.id)
  DeletePermission = makeUnaryCall(
    'deletePermission',
    pipe(
      validateInput(Permission, { groups: ['delete'] }),
      req =>
        req.then(p =>
          this.permissionService.delete(p).then(response => ({ response })),
        ),
    ),
  )

  /****************
   * RoleServices *
   ***************/
  // Create a new Role
  CreateRole = makeUnaryCall(
    'createRole',
    pipe(
      validateInput(Role, { groups: ['create'] }),
      req =>
        req
          .then(role => this.roleService.create(role))
          .then(role => classToPlain(role)),
    ),
  )

  // Get a list of roles based on a TypeORM query
  ReadRole = makeUnaryCall(
    'readRole',
    pipe(
      validateInput(QueryRequest),
      req =>
        req.then(({ clause }) =>
          this.roleService
            .read(clause)
            .then(rs => ({ roles: classToPlain(rs) as M.Role[] })),
        ),
    ),
  )

  // Get a single role based on a TypeORM query
  ReadOneRole = makeUnaryCall(
    'readOneRole',
    pipe(
      validateInput(QueryRequest),
      req =>
        req.then(({ clause }) =>
          this.roleService
            .readOne(clause)
            .then(r => r && (classToPlain(r) as M.Role))
            .then(undefinedToEmpty),
        ),
    ),
  )

  // Update a role (requires role.id)
  UpdateRole = makeUnaryCall(
    'updateRole',
    pipe(
      validateInput(Role, { groups: ['update'] }),
      req =>
        req.then(r =>
          this.roleService.update(r).then(response => ({ response })),
        ),
    ),
  )

  // Delete a role (requires role.id)
  DeleteRole = makeUnaryCall(
    'deleteRole',
    pipe(
      validateInput(Role, { groups: ['update'] }),
      req =>
        req.then(r =>
          this.roleService.delete(r).then(response => ({ response })),
        ),
    ),
  )

  /****************
   * AuthServices *
   ***************/
  // Login a user based on email and password
  Login = makeUnaryCall(
    'login',
    pipe(
      validateInput(Credentials),
      req =>
        req.then(creds =>
          this.authService.login(creds).then(value => ({ value })),
        ),
    ),
  )

  // Checks if JSON Web Token is valid
  IsValid = makeUnaryCall(
    'isValid',
    pipe(
      validateInput(StringValue),
      req =>
        req.then(({ value }) =>
          this.authService
            .isValid(value)
            .then(
              token =>
                !token
                  ? { valid: false as false }
                  : { valid: true as true, token },
            ),
        ),
    ),
  )

  // Checks if user (via JWT) has permissions for resource at requested level
  CanAccess = makeUnaryCall(
    'canAccess',
    pipe(
      validateInput(AccessRequest),
      req =>
        req.then(access =>
          this.authService.canAccess(access).then(response => ({ response })),
        ),
    ),
  )

  // Grants permission to a user
  GrantPermissionToUser = makeUnaryCall(
    'grantPermissionToUser',
    pipe(
      validateInput(GrantRequest),
      req => req.then(grant => this.authService.grantToUser(grant)),
    ),
  )

  // Grants permission to a role
  GrantPermissionToRole = makeUnaryCall(
    'grantPermissionToRole',
    pipe(
      validateInput(GrantRequest),
      req => req.then(req => this.authService.grantToRole(req)),
    ),
  )

  // Revokes permission from a user
  RevokePermissionFromUser = makeUnaryCall(
    'revokePermissionFromUser',
    pipe(
      validateInput(GrantRequest),
      req => req.then(req => this.authService.revokeFromUser(req)),
    ),
  )

  // Revokes permission from a role
  RevokePermissionFromRole = makeUnaryCall(
    'revokePermissionFromRole',
    pipe(
      validateInput(GrantRequest),
      req => req.then(req => this.authService.revokeFromRole(req)),
    ),
  )

  LoginAs = makeUnaryCall(
    'loginAs',
    pipe(
      validateInput(LoginAsRequest),
      req =>
        req.then(req =>
          this.authService.loginAs(req).then(value => ({ value })),
        ),
    ),
  )

  GenerateResetToken = makeUnaryCall(
    'generateResetToken',
    pipe(
      validateInput(StringValue),
      req =>
        req.then(req =>
          this.authService.generateResetToken(req.value).then(r => {
            return { value: r }
          }),
        ),
    ),
  )

  ResetPassword = makeUnaryCall(
    'resetPassword',
    pipe(
      validateInput(ResetParams),
      req =>
        req.then(req =>
          this.authService.resetPassword(req.token, req.password).then(r => {
            return { value: r }
          }),
        ),
    ),
  )
}
