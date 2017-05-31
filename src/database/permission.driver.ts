import { Connection } from 'typeorm';
import { User, Auth, Permission, Level, Role } from './entities';
import * as scrypt from 'scrypt';

export class PermissionDriver {
    static async getPermissionsByRoleAndResource(connection : Connection, roleId : number, resource : string){
        let permissionRepo = connection.getRepository(Permission)

        let permissions = await permissionRepo.createQueryBuilder("permission")
                            .leftJoinAndSelect("permission.roles", "roles", `roles.id=${roleId}`)
                            .where(`permission.resource='${resource}'`)
                            .getMany();
        return Promise.resolve(permissions);
    }

    static async create(connection : Connection, resource : string, level : Level){
        let permissionRepo = connection.getRepository(Permission);

        let permission = new Permission();
        permission.resource = resource;
        permission.level = level;

        await permissionRepo.persist(permission);

        permission = await permissionRepo.findOne({resource, level});
        return Promise.resolve(permission);
    }

    static async grant(connection : Connection, userId : number, permissionId : number, isRole : boolean){
        console.log(`grant called with ${connection} : ${userId} : ${permissionId} : ${isRole}`)
        let permissionRepo = connection.getRepository(Permission);

        let permission = await permissionRepo.createQueryBuilder('permission')
                                    .leftJoinAndSelect('permission.users', 'users')
                                    .leftJoinAndSelect('permission.hasRole', 'hasRole')
                                    .where(`permission.id=${permissionId}`)
                                    .getOne();

        console.log('found permission for id', permission);
        if(!isRole){
            let userRepo = connection.getRepository(User);
            let user = await userRepo.createQueryBuilder('user')
                                    .leftJoinAndSelect('user.permissions', 'permissions')
                                    .where(`user.id=${userId}`)
                                    .getOne();

            if(!permission || !user) return Promise.reject({error: "Permissions not granted"});
            permission.users.push(user);
            user.permissions.push(permission);
            await permissionRepo.persist(permission);
            await userRepo.persist(user);

            return Promise.resolve({permissionId: permission.id, userId: user.id});
        } else {
            let roleRepo = connection.getRepository(Role);
            let role = await roleRepo.createQueryBuilder('role')
                                .leftJoinAndSelect('role.permissions', 'permissions')
                                .where(`role.id=${userId}`)
                                .getOne();

            if(!permission || !role) return Promise.reject({error: "Permissions not granted"}); 
            permission.hasRole.push(role);
            role.permissions.push(permission);
            console.log('saving permission', permission);
            await permissionRepo.persist(permission);
            console.log('saving role', role);
            await roleRepo.persist(role);

            console.log('returning');

            return Promise.resolve({permissionId: permission.id, roleId: role.id});
        }


    }

    static async find(connection : Connection, resource : string, level : Level){
        let permissionRepo = connection.getRepository(Permission);

        let permission = await permissionRepo.findOne({resource, level});

        return Promise.resolve(permission);
    }

    static async findLike(connection : Connection, resource : string, level : Level){
        let permissionRepo = connection.getRepository(Permission);

        let permissions = await permissionRepo.createQueryBuilder('permission')
                                    .where(`permission.resource LIKE '${resource}'`)
                                    .andWhere(`permission.level=${level}`)
                                    .getMany();

        return Promise.resolve(permissions);
    }
}