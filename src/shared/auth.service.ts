import { Permission, User, Role, MySQLService } from '../database/mysql.service';
import { Credentials, UserService } from './user.service';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import * as scrypt from 'scrypt';
import * as _ from 'lodash';
import * as jwt from 'jwt-simple';

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

export class AuthService {

    static async login(creds: Credentials): Promise<User> {
        try {
            let user = await UserService.readOne(`user.email='${creds.email}'`);

            if (user === undefined) return Promise.reject({ error: 'EMAIL_NOT_FOUND' });

            const matches = await scrypt.verifyKdf(new Buffer(user.password, "base64"), creds.password);
            if (!matches) return Promise.reject({ error: 'INVALID_PASSWORD' });

            user.jwt = jwt.encode({ user: `${user.id}:${user.email}:${user.password}`, expires: new Date(new Date().getTime() + 60000000) }, MySQLService.jwtSecret);

            user = _.omit(user, ['password']);

            await UserService.update(_.omit(user, ['permissions', 'roles']));

            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async isValid(token: string): Promise<boolean> {
        if (token === '' || token === undefined) return Promise.reject({ error: 'INVALID_TOKEN' });
        try {
            let user = await UserService.readOne(`user.jwt='${token}'`);

            if (!user) return Promise.resolve(false);

            const decoded = jwt.decode(token, MySQLService.jwtSecret);
            if (decoded.user != `${user.id}:${user.email}:${user.password}`) return Promise.resolve(false);
            if (new Date(decoded.expires) <= new Date()) return Promise.resolve(false);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async canAccess(accessRequest: AccessRequest): Promise<boolean> {
        try {
            let user = await UserService.readOne(`user.jwt='${jwt}'`);

            if (user === undefined) return Promise.resolve(false);
            let permissions = user.permissions;

            for (let role of user.roles) {
                permissions.concat(role.permissions);
            }

            let canAccess = false;
            for (let permission of permissions) {
                if (permission.resource === accessRequest.resource && permission.level >= accessRequest.level) canAccess = true;
                if (permission.resource === accessRequest.resource && permission.level === 0) return Promise.resolve(false);
            }

            return Promise.resolve(canAccess);
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

            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async revokeFromUser(grantRequest: GrantRequest): Promise<PermissionSet> {
        try {
            let permission = await PermissionService.readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);

            if (permission === undefined) return Promise.reject({ error: "PERMISSION_NOT_FOUND" });

            permission.users = permission.users.filter(user => { return user.id === grantRequest.accessorId; });
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['roles']));

            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async revokeFromRole(grantRequest: GrantRequest): Promise<PermissionSet> {
        try {
            let permission = await PermissionService.readOne(`permission.resource='${grantRequest.resource}' AND permission.level=${grantRequest.level}`);

            if (permission === undefined) return Promise.reject({ error: "PERMISSION_NOT_FOUND" });

            permission.roles = permission.roles.filter(role => { return role.id === grantRequest.accessorId; });
            await MySQLService.connection.getRepository(Permission).persist(_.omit(permission, ['users']));

            return Promise.resolve({ permissionId: permission.id, accessorId: grantRequest.accessorId });
        } catch (error) {
            return Promise.reject(error);
        }
    }

}