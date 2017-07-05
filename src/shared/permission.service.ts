import { Permission, MySQLService } from '../database/mysql.service';
import * as _ from 'lodash';

const permissionRepository = MySQLService.connection.getRepository(Permission);

export class PermissionService {

    static async create(permission : Permission) : Promise<Permission> {
        
        permission = _.omit(permission, [ 'id' ]);

        try {
            await permissionRepository.persist(permission);

            return Promise.resolve(permission);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async read(clause : string) : Promise<Permission[]> {
        try {
            let permissions = await permissionRepository.createQueryBuilder('permission')
                .leftJoinAndSelect('permission.users', 'users')
                .leftJoinAndSelect('permission.roles', 'roles')
                .where(clause)
                .getMany();

            return Promise.resolve(permissions);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(permission : Permission) : Promise<boolean> {
        let update = _.omit(permission, [
            'user',
            'roles'
        ]);

        try {
            await permissionRepository.persist(permission);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(permission : Permission) : Promise<boolean> {
        try {
            await permissionRepository.removeById(permission.id);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}