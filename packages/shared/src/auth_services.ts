import * as grpc from 'grpc'

export namespace authservices {
  export interface AuthServiceImplementation {
    CreateUser: grpc.handleUnaryCall<User, User>
    ReadUser: grpc.handleUnaryCall<QueryRequest, UserBatch>
    ReadOneUser: grpc.handleUnaryCall<QueryRequest, User>
    UpdateUser: grpc.handleUnaryCall<User, BooleanResponse>
    DeleteUser: grpc.handleUnaryCall<User, BooleanResponse>
    AddRoleToUser: grpc.handleUnaryCall<RoleOperation, BooleanResponse>
    RemoveRoleFromUser: grpc.handleUnaryCall<RoleOperation, BooleanResponse>
    CreatePermission: grpc.handleUnaryCall<Permission, Permission>
    ReadPermission: grpc.handleUnaryCall<QueryRequest, PermissionBatch>
    ReadOnePermission: grpc.handleUnaryCall<QueryRequest, Permission>
    UpdatePermission: grpc.handleUnaryCall<Permission, BooleanResponse>
    DeletePermission: grpc.handleUnaryCall<Permission, BooleanResponse>
    CreateRole: grpc.handleUnaryCall<Role, Role>
    ReadRole: grpc.handleUnaryCall<QueryRequest, RoleBatch>
    ReadOneRole: grpc.handleUnaryCall<QueryRequest, Role>
    UpdateRole: grpc.handleUnaryCall<Role, BooleanResponse>
    DeleteRole: grpc.handleUnaryCall<Role, BooleanResponse>
    Login: grpc.handleUnaryCall<Credentials, UserJWT>
    IsValid: grpc.handleUnaryCall<UserJWT, IsValidResponse>
    CanAccess: grpc.handleUnaryCall<AccessRequest, BooleanResponse>
    GrantPermissionToUser: grpc.handleUnaryCall<GrantRequest, PermissionSet>
    GrantPermissionToRole: grpc.handleUnaryCall<GrantRequest, PermissionSet>
    RevokePermissionFromUser: grpc.handleUnaryCall<GrantRequest, PermissionSet>
    RevokePermissionFromRole: grpc.handleUnaryCall<GrantRequest, PermissionSet>
    LoginAs: grpc.handleUnaryCall<LoginAsRequest, UserJWT>
  }
  export interface AuthServiceClient extends grpc.Client {
    CreateUser(argument: User, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    CreateUser(argument: User, options: grpc.CallOptions | null, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    CreateUser(argument: User, metadata: grpc.Metadata | null, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    CreateUser(argument: User, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    ReadUser(argument: QueryRequest, callback: grpc.requestCallback<UserBatch>): grpc.ClientUnaryCall
    ReadUser(argument: QueryRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<UserBatch>): grpc.ClientUnaryCall
    ReadUser(argument: QueryRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<UserBatch>): grpc.ClientUnaryCall
    ReadUser(argument: QueryRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<UserBatch>): grpc.ClientUnaryCall
    ReadOneUser(argument: QueryRequest, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    ReadOneUser(argument: QueryRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    ReadOneUser(argument: QueryRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    ReadOneUser(argument: QueryRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<User>): grpc.ClientUnaryCall
    UpdateUser(argument: User, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdateUser(argument: User, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdateUser(argument: User, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdateUser(argument: User, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteUser(argument: User, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteUser(argument: User, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteUser(argument: User, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteUser(argument: User, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    AddRoleToUser(argument: RoleOperation, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    AddRoleToUser(argument: RoleOperation, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    AddRoleToUser(argument: RoleOperation, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    AddRoleToUser(argument: RoleOperation, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    RemoveRoleFromUser(argument: RoleOperation, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    RemoveRoleFromUser(argument: RoleOperation, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    RemoveRoleFromUser(argument: RoleOperation, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    RemoveRoleFromUser(argument: RoleOperation, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    CreatePermission(argument: Permission, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    CreatePermission(argument: Permission, options: grpc.CallOptions | null, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    CreatePermission(argument: Permission, metadata: grpc.Metadata | null, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    CreatePermission(argument: Permission, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    ReadPermission(argument: QueryRequest, callback: grpc.requestCallback<PermissionBatch>): grpc.ClientUnaryCall
    ReadPermission(argument: QueryRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionBatch>): grpc.ClientUnaryCall
    ReadPermission(argument: QueryRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<PermissionBatch>): grpc.ClientUnaryCall
    ReadPermission(argument: QueryRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionBatch>): grpc.ClientUnaryCall
    ReadOnePermission(argument: QueryRequest, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    ReadOnePermission(argument: QueryRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    ReadOnePermission(argument: QueryRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    ReadOnePermission(argument: QueryRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<Permission>): grpc.ClientUnaryCall
    UpdatePermission(argument: Permission, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdatePermission(argument: Permission, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdatePermission(argument: Permission, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdatePermission(argument: Permission, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeletePermission(argument: Permission, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeletePermission(argument: Permission, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeletePermission(argument: Permission, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeletePermission(argument: Permission, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    CreateRole(argument: Role, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    CreateRole(argument: Role, options: grpc.CallOptions | null, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    CreateRole(argument: Role, metadata: grpc.Metadata | null, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    CreateRole(argument: Role, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    ReadRole(argument: QueryRequest, callback: grpc.requestCallback<RoleBatch>): grpc.ClientUnaryCall
    ReadRole(argument: QueryRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<RoleBatch>): grpc.ClientUnaryCall
    ReadRole(argument: QueryRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<RoleBatch>): grpc.ClientUnaryCall
    ReadRole(argument: QueryRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<RoleBatch>): grpc.ClientUnaryCall
    ReadOneRole(argument: QueryRequest, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    ReadOneRole(argument: QueryRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    ReadOneRole(argument: QueryRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    ReadOneRole(argument: QueryRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<Role>): grpc.ClientUnaryCall
    UpdateRole(argument: Role, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdateRole(argument: Role, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdateRole(argument: Role, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    UpdateRole(argument: Role, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteRole(argument: Role, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteRole(argument: Role, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteRole(argument: Role, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    DeleteRole(argument: Role, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    Login(argument: Credentials, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    Login(argument: Credentials, options: grpc.CallOptions | null, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    Login(argument: Credentials, metadata: grpc.Metadata | null, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    Login(argument: Credentials, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    IsValid(argument: UserJWT, callback: grpc.requestCallback<IsValidResponse>): grpc.ClientUnaryCall
    IsValid(argument: UserJWT, options: grpc.CallOptions | null, callback: grpc.requestCallback<IsValidResponse>): grpc.ClientUnaryCall
    IsValid(argument: UserJWT, metadata: grpc.Metadata | null, callback: grpc.requestCallback<IsValidResponse>): grpc.ClientUnaryCall
    IsValid(argument: UserJWT, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<IsValidResponse>): grpc.ClientUnaryCall
    CanAccess(argument: AccessRequest, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    CanAccess(argument: AccessRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    CanAccess(argument: AccessRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    CanAccess(argument: AccessRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<BooleanResponse>): grpc.ClientUnaryCall
    GrantPermissionToUser(argument: GrantRequest, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToUser(argument: GrantRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToUser(argument: GrantRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToUser(argument: GrantRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToRole(argument: GrantRequest, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToRole(argument: GrantRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToRole(argument: GrantRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    GrantPermissionToRole(argument: GrantRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromUser(argument: GrantRequest, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromUser(argument: GrantRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromUser(argument: GrantRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromUser(argument: GrantRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromRole(argument: GrantRequest, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromRole(argument: GrantRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromRole(argument: GrantRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    RevokePermissionFromRole(argument: GrantRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<PermissionSet>): grpc.ClientUnaryCall
    LoginAs(argument: LoginAsRequest, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    LoginAs(argument: LoginAsRequest, options: grpc.CallOptions | null, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    LoginAs(argument: LoginAsRequest, metadata: grpc.Metadata | null, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
    LoginAs(argument: LoginAsRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<UserJWT>): grpc.ClientUnaryCall
  }
  export interface QueryRequest {
    clause?: string
  }
  export interface UserJWT {
    token?: string
  }
  export interface BooleanResponse {
    response?: boolean
  }
  export interface Credentials {
    email?: string
    password?: string
    services?: string
  }
  export interface User {
    id?: number
    email?: string
    services?: string
    permissions?: Array<Permission>
    roles?: Array<Role>
    isEnabled?: boolean
    password?: string
    extId?: string
    resetToken?: string
    lastLogin?: string
  }
  export interface AccessRequest {
    resource?: string
    level?: number
    email?: string
    id?: string
  }
  export interface Role {
    id?: number
    name?: string
    permissions?: Array<Permission>
    service?: string
    users?: Array<User>
  }
  export interface IsValidResponse {
    valid?: boolean
    token?: JWTPayload
  }
  export interface JWTPayload {
    email?: string
    extId?: string
  }
  export interface Permission {
    id?: number
    resource?: string
    level?: number
    roles?: Array<Role>
    users?: Array<User>
  }
  export interface GrantRequest {
    resource?: string
    level?: number
    accessorId?: number
  }
  export interface PermissionSet {
    permissionId?: number
    accessorId?: number
  }
  export interface RoleOperation {
    userEmail?: string
    roleId?: number
  }
  export interface UserBatch {
    users?: Array<User>
  }
  export interface RoleBatch {
    roles?: Array<Role>
  }
  export interface PermissionBatch {
    permissions?: Array<Permission>
  }
  export interface LoginAsRequest {
    adminId?: number
    userId?: number
  }
}