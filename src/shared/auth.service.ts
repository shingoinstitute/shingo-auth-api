import { Permission, User, Role, MySQLService } from '../database/mysql.service';
import { Credentials, UserService } from './user.service';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import * as scrypt from 'scrypt';
import * as _ from 'lodash';
import * as jwt from 'jwt-simple';

const permissionRepository = MySQLService.connection.getRepository(Permission);
const userRepository = MySQLService.connection.getRepository(User);
const roleRepository = MySQLService.connection.getRepository(Role);

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
            let user = await UserService.read(`user.email=${creds.email}`)[0];
            const matches = await scrypt.verifyKdf(new Buffer(user.password, "base64"), creds.password);
            if(!matches)return Promise.reject({ error: 'INVALID_PASSWORD' });

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
            let user = await UserService.read(`user.jwt=${token}`)[0];
            
            const decoded = jwt.decode(token, MySQLService.jwtSecret);
            if(decoded != `${user.id} ${user.email}`) return Promise.reject(false);
            if(new Date(decoded.expires) <= new Date()) return Promise.reject(false);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async canAccess(accessRequest : AccessRequest) : Promise<boolean> {
        try {
            let user = await UserService.read(`user.jwt=${jwt}`)[0];
            let permissions = user.permissions.append(user.role.permissions);
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
            let permission = PermissionService.read(`permission.resource=${grantRequest.resource} AND permission.level=${grantRequest.level}`)[0];
            let user = UserService.read(`user.id=${grantRequest.accessorId}`)[0];
            permission.users.push(user);
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['roles']));

            return Promise.resolve({ permissionId : permission.id, accessorId: user.id });
        } catch(error) {
            return Promise.resolve(error);
        }
    }

    static async grantToRole(grantRequest : GrantRequest) : Promise<PermissionSet> {
        try {
            let permission = PermissionService.read(`permission.resource=${grantRequest.resource} AND permission.level=${grantRequest.level}`)[0];
            let role = RoleService.read(`role.id=${grantRequest.accessorId}`)[0];
            permission.roles.push(role);
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['users']));

            return Promise.resolve({ permissionId : permission.id, accessorId: role.id });
        } catch(error) {
            return Promise.resolve(error);
        }
    }
    
}