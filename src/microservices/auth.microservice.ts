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
            .catch(error => callback(error));
    }

    isValid(call, callback){
        UserService.isValid(call.request.value)
            .then(valid => callback(null, valid))
            .catch(error => callback(error));
    }

    createUser(call, callback){
        console.log('Creating users with request: ', call.request);        
        UserService.create(call.request)
            .then(user => callback(null, user))
            .catch(error => callback(error));
    }

    updateUser(call, callback){
        UserService.update(call.request)
            .then(updated => callback(null, updated))
            .catch(error => callback(error));
    }

    getUser(call, callback){
        UserService.get(call.request.value)
            .then(user => callback(null, user))
            .catch(error => callback(error));
    }

    canAccess(call, callback){
        PermissionService.canAccess(call.request)
            .then(valid => callback(null, valid))
            .catch(error => callback(error));
    }

    createPermission(call, callback){
        let req = callback.request;
        PermissionService.create(req.resource, req.level)
            .then(permission => callback(null, permission))
            .catch(error => callback(error));
    }

    grantPermission(call, callback){
        PermissionService.grant(call.request)
            .then(permissionSet => callback(null, permissionSet))
            .catch(error => callback(error));
    }

    createRole(call, callback){
        RoleService.create(call.request)
            .then(role => callback(null, role))
            .catch(error => callback(error));
    }

    getRole(call, callback){
        RoleService.get(call.request.value)
            .then(role => callback(null, role))
            .catch(error => callback(error));
    }

    getRoles(call){
        RoleService.getAll(call.request.filter)
            .then(roles => {
                roles.forEach(role => call.write(role));
                call.end();
            })
            .catch(error => call.error(error));
    }
}