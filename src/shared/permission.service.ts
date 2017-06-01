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

        let user = permission.users.find(user => { return user.jwt === accessRequest.jwt });
        if(user === undefined) return Promise.reject({error: "USER_HAS_NO_PERMISSION"});
        user.permissions.forEach(p => {
            if(p.resource === accessRequest.resource && p.level === 0) return Promise.reject({error: "USER_DENIED_PERMISSION_"});
        });

        return Promise.resolve(true);
    }

    static async create(resource : string, level : number) : Promise<Permission>{
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission = new Permission();
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
                .leftJoinAndSelect('permission.users', 'user')
                .leftJoinAndSelect('permission.roles', 'roles')
                .where('permission.resource=:resource', { resource })
                .andWhere('permission.level=:level',{ level })
                .getOne();

        if(permission === undefined) return Promise.reject({error: "PERMISSION_NOT_FOUND"});

        return Promise.resolve(permission);
    }

    static async grant(req : GrantRequest) : Promise<PermissionSet>{
        if(req.permissionId === undefined && (req.resource === undefined || req.level === undefined))
            return Promise.reject({error: "MISSING_FIELDS", fields: [{ or: ['permisssionId', 'resource && level']}]});
        
        let permissionRepository = MySQLService.connection.getRepository(Permission);

        let permission;
        if(req.permissionId) permission = await PermissionService.getById(req.permissionId);             
        else {
            try {
                permission = await PermissionService.get(req.resource, req.level);
            } catch (error) {
                if(error.error = "PERMISSION_NOT_FOUND") permission = await PermissionService.create(req.resource, req.level);
            }
        }

        if(req.userId !== undefined){
            let userRepository = MySQLService.connection.getRepository(User);
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.permissions', 'permissions')
                .where('user.id=:id', {id: req.userId})
                .getOne();
            
            if(user === undefined) return Promise.reject({error: "USER_NOT_FOUND"});

            user.permissions.push(permission);
            permission.users.push(user);
            await permissionRepository.persist(permission);
            await userRepository.persist(user);
            return Promise.resolve({permissionId: permission.id, accessorId: user.id});
        } else if(req.roleId !== undefined){
            let roleRepository = MySQLService.connection.getRepository(Role);
            let role = await roleRepository.createQueryBuilder('role')
                .leftJoinAndSelect('role.permissions', 'permissions')
                .where('role.id=:id', {id: req.roleId})
                .getOne();

            if(role === undefined) return Promise.reject({error: "ROLE_NOT_FOUND"});

            role.permissions.push(permission);
            permission.roles.push(role);
            await permissionRepository.persist(permission);
            await roleRepository.persist(role);
            return Promise.resolve({permissionId: permission.id, accessorId: role.id});
        }

        return Promise.reject({error: "UNEXPECTED_STATE"});
    }
}