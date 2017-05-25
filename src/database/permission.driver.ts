import { Connection } from 'typeorm';
import { User, Auth, Permission, Level } from './entities';
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

    static async grant(connection : Connection, userId : number, permissionId : number){
        let permissionRepo = connection.getRepository(Permission);
        let userRepo = connection.getRepository(User);

        let permission = await permissionRepo.findOneById(permissionId);
        let user = await userRepo.findOneById(userId);

        if(!permission || !user) return Promise.resolve();

        permission.users.push(user);
        user.permissions.push(permission);

        await permissionRepo.persist(permission);
        await userRepo.persist(user);

        return Promise.resolve({permission, user});
    }

    static async find(connection : Connection, resource : string, level : Level){
        let permissionRepo = connection.getRepository(Permission);

        let permission = await permissionRepo.findOne({resource, level});

        return Promise.resolve(permission);
    }
}