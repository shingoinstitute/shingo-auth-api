import { Role, MySQLService } from '../database/mysql.service';

export class RoleService {

    static async create(role : Role) : Promise<Role> {
        let roleRepository = MySQLService.connection.getRepository(Role);

        await roleRepository.persist(role);

        return Promise.resolve(role);
    }

    static async get(name : string) : Promise<Role> {
        let roleRepository = MySQLService.connection.getRepository(Role);

        let role = roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.users', 'users')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .where('role.name=:name', { name })
            .getOne();

        if(role === undefined) return Promise.reject({error: "ROLE_NOT_FOUND"});

        return Promise.resolve(role);
    }

    static async getAll(filter : string) : Promise<[Role[], number]> {
        let roleRepository = MySQLService.connection.getRepository(Role);

        let roles = await roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.users', 'users')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .where(filter)
            .getManyAndCount();

        return Promise.resolve(roles);
    }
}