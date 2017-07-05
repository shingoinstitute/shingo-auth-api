import { Role, MySQLService } from '../database/mysql.service';
import * as _ from 'lodash';

const roleRepository = MySQLService.connection.getRepository(Role);

export class RoleService {

    static async create(role : Role) : Promise<Role> {
        role = _.omit(role, [
            'id'
        ]);

        try {
            await roleRepository.persist(role);

            return Promise.resolve(role);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async read(clause : string) : Promise<Role[]> {
        try {
            let roles = await roleRepository.createQueryBuilder('role')
                .leftJoinAndSelect('role.permissions', 'permissions')
                .leftJoinAndSelect('role.users', 'users')
                .where(clause)
                .getMany();

            return Promise.resolve(roles);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(role : Role) : Promise<boolean> {
        let update = _.omit(role, [
            'permissions',
            'users'
        ]);

        try {
            await roleRepository.persist(role);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(role : Role) : Promise<boolean> {
        try {
            await roleRepository.removeById(role.id);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}