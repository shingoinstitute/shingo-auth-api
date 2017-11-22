import { Permission, MySQLService } from '../database/mysql.service';
import * as _ from 'lodash';

export class PermissionService {

    static async create(permission: Permission): Promise<Permission> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);

        if (permission.id) permission = _.omit(permission, ['id']);

        try {
            permission = await permissionRepository.persist(permission);
            permission.roles = [];
            permission.users = [];

            return Promise.resolve(permission);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async read(clause: string): Promise<Permission[]> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);
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

    static async readOne(clause: string): Promise<Permission> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);
        try {
            let permission = await permissionRepository.createQueryBuilder('permission')
                .leftJoinAndSelect('permission.users', 'users')
                .leftJoinAndSelect('permission.roles', 'roles')
                .where(clause)
                .getOne();

            return Promise.resolve(permission);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(permission: Permission): Promise<boolean> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);
        let update = _.omit(permission, [
            'users',
            'roles'
        ]);

        try {
            await permissionRepository.persist(permission);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(permission: Permission): Promise<boolean> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);
        try {
            if (!permission.id) permission = await permissionRepository.findOne({ resource: permission.resource, level: permission.level });
            if (!permission) return Promise.resolve(true);
            await permissionRepository.removeById(permission.id);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}