import { Permission, MySQLService, Level } from '../database/mysql.service';
import * as _ from 'lodash';
import { LoggerService } from './logger.service';
import { RequireKeys } from '../util';

export class PermissionService {

    static auditLog = new LoggerService('auth-api.audit.log');

    static async create(permission: { resource: string, level: Level }): Promise<Permission> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);

        return permissionRepository.create(permission).save().then(p => {
            PermissionService.auditLog.info('Permission created: %j', permission);
            return p
        });
    }

    static async read(clause: string): Promise<Permission[]> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);

        return permissionRepository.createQueryBuilder('permission')
            .leftJoinAndSelect('permission.users', 'users')
            .leftJoinAndSelect('permission.roles', 'roles')
            .where(clause)
            .getMany();
    }

    static async readOne(clause: string): Promise<Permission | undefined> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);

        return permissionRepository.createQueryBuilder('permission')
            .leftJoinAndSelect('permission.users', 'users')
            .leftJoinAndSelect('permission.roles', 'roles')
            .where(clause)
            .getOne();
    }

    static async update(permission: RequireKeys<Partial<Permission>, 'id'>): Promise<boolean> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);

        await permissionRepository.save(permission);

        return true;
    }

    static async delete(permission: Permission): Promise<boolean> {
        const permissionRepository = MySQLService.connection.getRepository(Permission);

        const id = await (
            typeof permission.id === 'undefined'
            ? permissionRepository.findOne({ resource: permission.resource, level: permission.level }).then(p => p && p.id)
            : Promise.resolve(permission.id)
        )

        if (!id) return true;

        await permissionRepository.delete(id)

        PermissionService.auditLog.info('Permission deleted: %j', permission);

        return true;
    }
}