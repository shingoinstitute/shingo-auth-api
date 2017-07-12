import * as grpc from 'grpc';
import * as path from 'path';
import { MySQLService } from '../database/mysql.service';
import { UserService, PermissionService, RoleService, AuthService } from '../shared';

function errorHandler(error, callback, message) {
    console.error(message, error);    
    const metadata = new grpc.Metadata();
    metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
    callback({
        code: grpc.status.INTERNAL,
        details: 'INTERNAL_ERROR',
        metadata: metadata
    });
}

function streamErrorHandler(error, call, message) {
    console.error(message, error);                    
    const metadata = new grpc.Metadata();
    metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
    call.emit('error', {
        code: grpc.status.INTERNAL,
        details: 'INTERNAL_ERROR',
        metadata: metadata
    });
}

export class AuthMicroservice {

    public authServices;

    constructor(protoPath? : string){
        if(protoPath === undefined) protoPath = path.join(__dirname, '../proto/auth_services.proto');
        this.authServices = grpc.load(protoPath).authservices;
        MySQLService.init()
        .then(() => {
            console.log('DB initialized');
        })
        .catch(error => {
            console.error('Error initializing DB: ', error);
        });
    }

    /****************
     * UserServices *
     ***************/
    // Create a new user
    createUser(call, callback){
        UserService.create(call.request)
            .then(user => callback(null, user))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.createUser(): '));
    }

    // Get a list of users based on a TypeORM query
    readUser(call){
        UserService.read(call.request.clause)
            .then(users => {
                users.forEach(user => call.write(user));
                call.end();
            })
            .catch(error => streamErrorHandler(error, call, 'Error in Authmicroservice.readUser(): '));
    }

    // Update a user (requires user.id)
    updateUser(call, callback){
        UserService.update(call.request)
            .then(updated => callback(null, { response: updated }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.updateUser(): '));
    }

    // Delete a user (requires user.id)
    deleteUser(call, callback){
        UserService.delete(call.request)
            .then(deleted => callback(null, { response: deleted }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.deleteUser(): '));
    }

    // Add a role to a user (requires userId and roleId)
    addRoleToUser(call, callback){
        UserService.addRole(call.request)
            .then(added => callback(null, { response: added }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservice.addRoleToUser(): '));
    }

    // Remove a role from a user (requires userId and roleId)
    removeRoleFromUser(call, callback){
        UserService.removeRole(call.request)
            .then(removed => callback(null, { response: removed }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservice.removeRoleFromUser(): '));
    }

    /**********************
     * PermissionServices *
     *********************/
    // Create a new permission
    createPermission(call, callback){
        PermissionService.create(call.request)
            .then(permission => callback(null, permission))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.createPermission(): '));
    }

    // Get a list of permissions based on a TypeORM query
    readPermission(call){
        PermissionService.read(call.request.clause)
            .then(permissions => {
                permissions.forEach(permission => call.write(permission));
                call.end();
            })
            .catch(error => streamErrorHandler(error, call, 'Error in Authmicroservice.readPermission(): '));
    }

    // Update a permission (requires permission.id)
    updatePermission(call, callback){
        PermissionService.update(call.request)
            .then(updated => callback(null, { response: updated }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.updatePermission(): '));
    }

    // Delete a permission (requires permission.id)
    deletePermission(call, callback){
        PermissionService.delete(call.request)
            .then(deleted => callback(null, { response: deleted }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.deletePermission(): '));
    }

    /****************
     * RoleServices *
     ***************/
    // Create a new Role
    createRole(call, callback){
        RoleService.create(call.request)
            .then(role => callback(null, role))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.createRole(): '));
    }

    // Get a list of roles based on a TypeORM query
    readRole(call){
        RoleService.read(call.request.clause)
            .then(roles => {
                roles.forEach(role => call.write(role));
                call.end();
            })
            .catch(error => streamErrorHandler(error, call, 'Error in Authmicroservice.readRole(): '));
    }

    // Update a role (requires role.id)
    updateRole(call, callback){
        RoleService.update(call.request)
            .then(updated => callback(null, { response: updated }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.updateRole(): '));
    }

    // Delete a role (requires role.id)
    deleteRole(call, callback){
        RoleService.delete(call.request)
            .then(deleted => callback(null, { response: deleted }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMircoservice.deleteRole(): '));
    }

    /****************
     * AuthServices *
     ***************/
    // Login a user based on email and password
    login(call, callback){
        AuthService.login(call.request)
            .then(user => callback(null, user))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.login(): '));
    }

    // Checks if JSON Web Token is valid
    isValid(call, callback){
        AuthService.isValid(call.request.token)
            .then(isValid => callback(null, { response: isValid }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.isValid(): '));
    }

    // Checks if user (via JWT) has permissions for resource at requested level
    canAccess(call, callback){
        AuthService.canAccess(call.request)
            .then(canAccess => callback(null, { response: canAccess }))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.canAccess(): '));
    }

    // Grants permission to a user
    grantPermissionToUser(call, callback){
        AuthService.grantToUser(call.request)
            .then(permissionSet => callback(null, permissionSet))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.grantPermissionToUser(): '));
    }

    // Grants permission to a role
    grantPermissionToRole(call, callback){
        AuthService.grantToRole(call.request)
            .then(permissionSet => callback(null, permissionSet))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.grantPermissionToRole(): '));
    }

    // Revokes permission from a user
    revokePermissionFromUser(call, callback){
        AuthService.revokeFromUser(call.request)
            .then(permissionSet => callback(null, permissionSet))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.revokePermissionFromUser(): '));
    }

    // Revokes permission from a role
    revokePermissionFromRole(call, callback){
        AuthService.revokeFromRole(call.request)
            .then(permissionSet => callback(null, permissionSet))
            .catch(error => errorHandler(error, callback, 'Error in AuthMicroservices.revokePermissionFromRole(): '));
    }
}