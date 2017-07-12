import { Permission, User, Role, MySQLService } from '../database/mysql.service';
import { Credentials, UserService } from './user.service';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import * as scrypt from 'scrypt';
import * as _ from 'lodash';
import * as jwt from 'jwt-simple';

export interface AccessRequest {
    resource : string,
    level : number,
    jwt : string
}

export interface GrantRequest {
    resource : string,
    level : number,
    accessorId : number
}

export interface PermissionSet {
    permissionId : number,
    accessorId : number
}

export class AuthService {

    static async login(creds : Credentials) : Promise<User> {
        try {
            console.log('Searching for user', creds);
            let users = await UserService.read(`user.email='${creds.email}'`);
            console.log('found: ', users);
            let user = users[0];
            if(user === undefined) return Promise.reject({error: 'EMAIL_NOT_FOUND'});

            const matches = await scrypt.verifyKdf(new Buffer(user.password, "base64"), creds.password);
            if(!matches) return Promise.reject({ error: 'INVALID_PASSWORD' });

            user = _.omit(user, ['password']);

            user.jwt = jwt.encode({user: `${user.id} ${user.email}`, expires: new Date(new Date().getTime() + 600000)}, MySQLService.jwtSecret);

            await UserService.update(_.omit(user, ['permissions', 'roles']));

            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async isValid(token : string) : Promise<boolean> {
        try {
            let users = await UserService.read(`user.jwt='${token}'`);
            let user = users[0];
            
            const decoded = jwt.decode(token, MySQLService.jwtSecret);
            if(decoded.user != `${user.id} ${user.email}`) return Promise.resolve(false);
            if(new Date(decoded.expires) <= new Date()) return Promise.resolve(false);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async canAccess(accessRequest : AccessRequest) : Promise<boolean> {
        try {
            let users = await UserService.read(`user.jwt='${jwt}'`);
            let user = users[0];
            if(user === undefined) return Promise.resolve(false);
            let permissions = user.permissions;

            for(let role of user.roles){
                permissions.concat(role.permissions);
            }

            let canAccess = false;
            for(let permission of permissions) {
                if(permission.resource === accessRequest.resource && permission.level >= accessRequest.level) canAccess = true;
                if(permission.resource === accessRequest.resource && permission.level === 0) return Promise.resolve(false);
            }

            return Promise.resolve(canAccess);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async grantToUser(grantRequest : GrantRequest) : Promise<PermissionSet> {
        try {
            let permissions = await PermissionService.read(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);
            let permission = permissions[0];

            if(permission === undefined) permission = await PermissionService.create({ resource: grantRequest.resource, level: grantRequest.level } as Permission);

            permission.users.push({ id: grantRequest.accessorId } as User);
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['roles']));

            return Promise.resolve({ permissionId : permission.id, accessorId: grantRequest.accessorId });
        } catch(error) {
            return Promise.reject(error);
        }
    }

    static async grantToRole(grantRequest : GrantRequest) : Promise<PermissionSet> {
        try {
            let permissions = await PermissionService.read(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);
            let permission = permissions[0];

            if(permission === undefined) permission = await PermissionService.create({ resource: grantRequest.resource, level: grantRequest.level } as Permission);

            permission.roles.push({ id: grantRequest.accessorId } as Role);
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['users']));

            return Promise.resolve({ permissionId : permission.id, accessorId: grantRequest.accessorId });
        } catch(error) {
            return Promise.reject(error);
        }
    }

    static async revokeFromUser(grantRequest : GrantRequest) : Promise<PermissionSet> {
        try {
            let permissions = await PermissionService.read(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);
            let permission = permissions[0];

            if(permission === undefined) return Promise.reject({error: "PERMISSION_NOT_FOUND"});

            permission.users = permission.users.filter(user => { return user.id === grantRequest.accessorId; });
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['roles']));

            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch(error) {
            return Promise.reject(error);
        }
    }

    static async revokeFromRole(grantRequest : GrantRequest) : Promise<PermissionSet> {
        try {
            let permissions = await PermissionService.read(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);
            let permission = permissions[0];

            if(permission === undefined) return Promise.reject({error: "PERMISSION_NOT_FOUND"});

            permission.roles = permission.roles.filter(role => { return role.id === grantRequest.accessorId; });
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['users']));

            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch(error) {
            return Promise.reject(error);
        }
    }
    
}