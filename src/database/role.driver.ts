import { Connection } from 'typeorm';
import { User, Role } from './entities';
import * as scrypt from 'scrypt';

export class RoleDriver {

    static async find(connection : Connection, roleName : string){
        let roleRepo = connection.getRepository(Role);
        let role = await roleRepo.findOne({name: roleName});

        return Promise.resolve(role);
    }


    static async getWithPermissions(connection : Connection, roleId : number){
        let roleRepo = connection.getRepository(Role);
        let role = await roleRepo.createQueryBuilder('role')
                            .leftJoinAndSelect('role.permissions', 'permissions')
                            .where(`role.id=${roleId}`)
                            .getOne();

        return Promise.resolve(role)
    }
}