import { Permission, User, Role, MySQLService } from '../database/mysql.service';
import { UserService } from './user.service';

export interface GrantRequest {
    permissionId? : number,
    resource? : string,
    level? : number,
    userId? : number,
    roleId? : number
}

export interface PermissionSet {
    permissionId : number,
    accessorId : number
}

export interface AccessRequest {
    resource : string,
    level : number,
    jwt : string
}

export class PermissionService {

    static async canAccess(accessRequest : AccessRequest) : Promise<boolean> {
        let permission = await PermissionService.get(accessRequest.resource, accessRequest.level);

        if(permission === undefined) return Promise.reject({error: "PERMISSION_DNE"});

        let user = await UserService.get(accessRequest.jwt);
        let role = permission.roles.find(r =>{ return r.id === user.role.id });
        user = permission.users.find(u => { return u.id === user.id });
        if(user === undefined && role === undefined) return Promise.reject({error: "USER_HAS_NO_PERMISSION"});

        if(user !== undefined){
            let valid = await UserService.isValid(user.jwt);
            if(!valid) return Promise.reject({error: 'INVALID_TOKEN'});
            user.permissions.forEach(p => {
                if(p.resource === accessRequest.resource && p.level === 0) return Promise.reject({error: "USER_DENIED_PERMISSION"});
            });
        }

        if(role !== undefined){
            role.permissions.forEach(p => {
                if(p.resource === accessRequest.resource && p.level === 0) return Promise.reject({error: "ROLE_DENIED_PERMISSION"});
            });
        }

        return Promise.resolve(true);
    }

    static async create(resource : string, level : number) : Promise<Permission>{
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission = await PermissionService.get(resource, level);
        if(permission != undefined) return Promise.resolve(permission);
        permission = new Permission();
        permission.resource = resource;
        permission.level = level;

        await permissionRepository.persist(permission);

        return Promise.resolve(permission);
    }

    static async getById(id : number) : Promise<Permission>{
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission = permissionRepository.createQueryBuilder('permission')
                .leftJoinAndSelect('permission.users', 'user')
                .leftJoinAndSelect('permission.roles', 'roles')
                .where('permission.id=:id', { id })
                .getOne();               

        if(permission === undefined) return Promise.reject({error: "PERMISSION_NOT_FOUND"});

        return Promise.resolve(permission);
    }

    static async get(resource : string, level : number) : Promise<Permission> {
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission = permissionRepository.createQueryBuilder('permission')
                .leftJoinAndSelect('permission.users', 'users')
                .leftJoinAndSelect('permission.roles', 'roles')
                .where('permission.resource=:resource', { resource })
                .andWhere('permission.level=:level', { level })
                .getOne();

        if(permission === undefined) return Promise.reject({error: "PERMISSION_NOT_FOUND"});

        return Promise.resolve(permission);
    }

    static async grant(req : GrantRequest) : Promise<PermissionSet>{
        console.log('DEBUG: PermissionService.grant() ', req);
        if(req.permissionId === undefined && (req.resource === undefined || req.level === undefined))
            return Promise.reject({error: "MISSING_FIELDS", fields: [{ or: ['permisssionId', 'resource && level']}]});
        
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission = await PermissionService.get(req.resource, req.level);

        if(permission === undefined) permission = await PermissionService.create(req.resource, req.level);

        console.log('DEBUG: Beginning grant process for permission: ', permission);

        if(req.userId !== 0){
            let userRepository = MySQLService.connection.getRepository(User);
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.permissions', 'permissions')
                .where('user.id=:id', {id: req.userId})
                .getOne();

            console.log('DEBUG: Granting permission to user', user);            
            if(user === undefined) return Promise.reject({error: "USER_NOT_FOUND"});

            delete user.role;
            delete permission.roles;

            user.permissions.push(permission);
            await userRepository.persist(user);
            return Promise.resolve({permissionId: permission.id, accessorId: user.id});
        } else if(req.roleId !== 0){
            let roleRepository = MySQLService.connection.getRepository(Role);
            let role = await roleRepository.createQueryBuilder('role')
                .leftJoinAndSelect('role.permissions', 'permissions')
                .where('role.id=:id', {id: req.roleId})
                .getOne();

            console.log('DEBUG: Granting permission to role', role);
            if(role === undefined) return Promise.reject({error: "ROLE_NOT_FOUND"});

            delete role.users;
            delete permission.users;

            role.permissions.push(permission);
            await roleRepository.persist(role);
            return Promise.resolve({permissionId: permission.id, accessorId: role.id});
        }

        return Promise.reject({error: "UNEXPECTED_STATE"});
    }

    static async revoke(req : GrantRequest) : Promise<PermissionSet> {
        if(req.permissionId === undefined && (req.resource === undefined || req.level === undefined))
            return Promise.reject({error: "MISSING_FIELDS", fields: [{ or: ['permisssionId', 'resource && level']}]});
        
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission = await PermissionService.get(req.resource, req.level);

        if(permission === undefined) return Promise.reject({error: 'PERMISSION_NOT_FOUND'});

        console.log('DEBUG: Beginning revoke process for permission: ', permission);

        if(req.userId !== 0){
            let userRepository = MySQLService.connection.getRepository(User);
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.permissions', 'permissions')
                .where('user.id=:id', {id: req.userId})
                .getOne();
            
            if(user === undefined) return Promise.reject({error: "USER_NOT_FOUND"});

            delete user.role;
            delete permission.roles;

            user.permissions = user.permissions.filter(p => { return p.id != permission.id});
            await userRepository.persist(user);
            return Promise.resolve({permissionId: permission.id, accessorId: user.id});
        } else if(req.roleId !== 0){
            let roleRepository = MySQLService.connection.getRepository(Role);
            let role = await roleRepository.createQueryBuilder('role')
                .leftJoinAndSelect('role.permissions', 'permissions')
                .where('role.id=:id', {id: req.roleId})
                .getOne();

            console.log('DEBUG: Revoking permission from role', role);
            if(role === undefined) return Promise.reject({error: "ROLE_NOT_FOUND"});

            delete role.users;
            delete permission.users;

            role.permissions = role.permissions.filter(p => { return p.id != permission.id});
            await roleRepository.persist(role);
            return Promise.resolve({permissionId: permission.id, accessorId: role.id});
        }

        return Promise.reject({error: "UNEXPECTED_STATE"});
    }

    static async remove(req : Permission) {
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permissions = await permissionRepository.createQueryBuilder('permission')
                .leftJoinAndSelect('permission.users', 'user')
                .leftJoinAndSelect('permission.roles', 'roles')
                .where('permission.resource=:resource', { resource: req.resource })
                .andWhere('permission.level=:level', { level: req.level })
                .getMany();

        permissions.map(permission => {
            permission.users = [];
            permission.roles = [];
        });

        await permissionRepository.persist(permissions);
        await permissionRepository.remove(permissions);

        return Promise.resolve();
    }
}