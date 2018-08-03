import { LoggerService } from './logger.service';
import { Permission, User, Role, MySQLService } from '../database/mysql.service';
import { Credentials, UserService } from './user.service';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import * as scrypt from 'scrypt';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';

export interface AccessRequest {
    resource: string,
    level: number,
    jwt: string
}

export interface GrantRequest {
    resource: string,
    level: number,
    accessorId: number
}

export interface PermissionSet {
    permissionId: number,
    accessorId: number
}

export interface LoginAsRequest {
    adminId: number,
    userId: number
}

export class AuthService {

    static log = new LoggerService();
    static auditLog = new LoggerService('auth-api.audit.log');

    static async login(creds: Credentials): Promise<User> {
        try {
            let user = await UserService.readOne(`user.email='${creds.email}'`);

            if (user === undefined) {
                AuthService.auditLog.warn('[EMAIL_NOT_FOUND] Invalid log in attempt: ' + creds.email + '@' + creds.services);
                return Promise.reject({ error: 'EMAIL_NOT_FOUND' });
            }

            const matches = await scrypt.verifyKdf(new Buffer(user.password, "base64"), creds.password);
            if (!matches) {
                AuthService.auditLog.warn('[INVALID_PASSWORD] Invalid log in attempt: ' + creds.email + '@' + creds.services);
                return Promise.reject({ error: 'INVALID_PASSWORD' });
            }

            user.jwt = jwt.encode({ user: `${user.id}:${user.email}:${user.password}`, expires: new Date(new Date().getTime() + 60000000) }, MySQLService.jwtSecret);

            user = _.omit(user, ['password']);
            user.lastLogin = new Date().toUTCString();

            await UserService.update(_.omit(user, ['permissions', 'roles']));
            AuthService.auditLog.info('Successful login: ' + creds.email + '@' + creds.services);
            return Promise.resolve(user);
        } catch (error) {
            AuthService.log.error('Error logging in: ', error);
            return Promise.reject(error);
        }
    }

    static async isValid(token: string): Promise<boolean> {
        if (token === '' || token === undefined) return Promise.reject({ error: 'INVALID_TOKEN' });
        try {
            let user = await UserService.readOne(`user.jwt='${token}'`);

            if (!user) {
                AuthService.auditLog.warn('[INVALID_TOKEN] isValid returned false' + token);
                return Promise.resolve(false);
            }

            const decoded = jwt.decode(token, MySQLService.jwtSecret);
            if (decoded.user != `${user.id}:${user.email}:${user.password}`) {
                AuthService.auditLog.warn('[INVALID_TOKEN]  isValid returned false' + token);
                return Promise.resolve(false);
            }
            if (new Date(decoded.expires) <= new Date()) {
                AuthService.auditLog.warn('[EXPIRED_TOKEN]  isValid returned false' + token);                
                return Promise.resolve(false);
            }

            AuthService.auditLog.info('isValid returned true');
            
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async canAccess(accessRequest: AccessRequest): Promise<boolean> {
        try {
            let user = await UserService.readOne(`user.jwt='${accessRequest.jwt}'`);

            if (user === undefined) {
                AuthService.auditLog.warn('[USER_NOT_FOUND]  accessRequest denied: %j', accessRequest);                
                return Promise.resolve(false);
            }
            let permissions = user.permissions;

            for (let role of user.roles) {
                permissions = permissions.concat(role.permissions);
            }

            for (let permission of permissions) {
                if (permission.resource === accessRequest.resource && permission.level >= accessRequest.level) {
                    AuthService.auditLog.info('accessRequest accepted: %j', accessRequest);                
                    return Promise.resolve(true);
                }
            }

            AuthService.auditLog.warn('[NO_PERMISSION_FOUND]  accessRequest denied: %j', accessRequest);                
            
            return Promise.resolve(false);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async grantToUser(grantRequest: GrantRequest): Promise<PermissionSet> {
        try {
            let permission = await PermissionService.readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);

            if (permission === undefined) permission = await PermissionService.create({ resource: grantRequest.resource, level: grantRequest.level } as Permission);

            permission.users.push({ id: grantRequest.accessorId } as User);
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['roles']));
            AuthService.auditLog.info('[USER]  Permission Grant Request : %j', grantRequest);                
            
            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async grantToRole(grantRequest: GrantRequest): Promise<PermissionSet> {
        try {
            let permission = await PermissionService.readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);

            if (permission === undefined) permission = await PermissionService.create({ resource: grantRequest.resource, level: grantRequest.level } as Permission);

            permission.roles.push({ id: grantRequest.accessorId } as Role);
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['users']));
            AuthService.auditLog.info('[ROLE]  Permission Grant Request : %j', grantRequest);                
            
            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async revokeFromUser(grantRequest: GrantRequest): Promise<PermissionSet> {
        try {
            let permission = await PermissionService.readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);

            if (permission === undefined) return Promise.reject({ error: "PERMISSION_NOT_FOUND" });

            permission.users = permission.users.filter(user => { return user.id !== grantRequest.accessorId; });
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['roles']));
            AuthService.auditLog.info('[USER]  Permission Revoke Request : %j', grantRequest);                
            
            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async revokeFromRole(grantRequest: GrantRequest): Promise<PermissionSet> {
        try {
            let permission = await PermissionService.readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);

            if (permission === undefined) return Promise.reject({ error: "PERMISSION_NOT_FOUND" });

            permission.roles = permission.roles.filter(role => { return role.id !== grantRequest.accessorId; });
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['users']));
            AuthService.auditLog.info('[ROLE]  Permission Revoke Request : %j', grantRequest);                
            
            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async loginAs(loginAsRequest: LoginAsRequest): Promise<User>
    {
        try {
            let user = await UserService.readOne(`user.id='${loginAsRequest.userId}'`);

            user.jwt = jwt.encode({ user: `${user.id}:${user.email}:${user.password}`, expires: new Date(new Date().getTime() + 60000000) }, MySQLService.jwtSecret);
            await UserService.update(_.omit(user, ['permissions', 'roles', 'password']));

            AuthService.auditLog.info('Login As Request : %j', loginAsRequest);                            
            return Promise.resolve(user);
        } catch(error) {
            return Promise.reject(error);
        }
    }

}