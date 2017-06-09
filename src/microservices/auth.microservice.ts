import * as grpc from 'grpc';
import * as path from 'path';
import { MySQLService } from '../database/mysql.service';
import { UserService, PermissionService, RoleService } from '../shared';

export class AuthMicroservice {

    public authServices;

    constructor(protoPath? : string){
        MySQLService.init();
        if(protoPath === undefined) protoPath = path.join(__dirname, '../proto/auth_services.proto');
        this.authServices = grpc.load(protoPath).authservices;
    }

    login(call, callback){
        UserService.login(call.request)
            .then(user => callback(null, user))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INVALID_LOGIN',
                    metadata: metadata
                });
            });
    }

    isValid(call, callback){
        UserService.isValid(call.request.value)
            .then(valid => callback(null, valid))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    createUser(call, callback){
        console.log('Creating users with request: ', call.request);        
        UserService.create(call.request)
            .then(user => callback(null, user))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    updateUser(call, callback){
        UserService.update(call.request)
            .then(updated => callback(null, updated))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    getUser(call, callback){
        UserService.get(call.request.value)
            .then(user => callback(null, user))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    getUserByEmail(call, callback){
        UserService.getByEmail(call.request.value)
            .then(user => callback(null, user))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    canAccess(call, callback){
        PermissionService.canAccess(call.request)
            .then(valid => callback(null, valid))
            .catch(error => {
                console.error('Error in canAccess(): ', error);
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    createPermission(call, callback){
        let req = call.request;
        PermissionService.create(req.resource, req.level)
            .then(permission => callback(null, permission))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    grantPermission(call, callback){
        PermissionService.grant(call.request)
            .then(permissionSet => callback(null, permissionSet))
            .catch(error => {
                console.error('Error in grantPermission(): ', error);
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    removePermission(call, callback){
        PermissionService.remove(call.request)
            .then(() => callback(null, call.request))
            .catch(error => {
                console.error('Error in removePermission(): ', error);
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    createRole(call, callback){
        RoleService.create(call.request)
            .then(role => callback(null, role))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    getRole(call, callback){
        RoleService.get(call.request.value)
            .then(role => callback(null, role))
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                callback({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }

    getRoles(call){
        RoleService.getAll(call.request.filter)
            .then(roles => {
                roles.forEach(role => call.write(role));
                call.end();
            })
            .catch(error => {
                const metadata = new grpc.Metadata();
                metadata.add('error-bin', Buffer.from(JSON.stringify(error)));
                call.error({
                    code: grpc.status.INTERNAL,
                    details: 'INTERNAL_ERROR',
                    metadata: metadata
                });
            });
    }
}