import { LoggerService } from './logger.service';
import { Role, MySQLService } from '../database/mysql.service';
import * as _ from 'lodash';

export class RoleService {

    static auditLog = new LoggerService('auth-api.audit.log');

    static async create(role: Role): Promise<Role> {
        const roleRepository = MySQLService.connection.getRepository(Role);
        const cleanRole: _.Omit<Role, 'id'> = 
            role.id ? _.omit(role, [ 'id' ]) : role

        const created = await roleRepository.save(cleanRole as Role);
        RoleService.auditLog.info('Role created: %j', cleanRole);
        return created;
    }

    static async read(clause: string): Promise<Role[]> {
        const roleRepository = MySQLService.connection.getRepository(Role);

        return await roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .leftJoinAndSelect('role.users', 'users')
            .where(clause)
            .getMany();
    }

    static async readOne(clause: string): Promise<Role | undefined> {
        const roleRepository = MySQLService.connection.getRepository(Role);

        return roleRepository.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .leftJoinAndSelect('role.users', 'users')
            .where(clause)
            .getOne();
    }

    static async update(role: Role): Promise<boolean> {
        const roleRepository = MySQLService.connection.getRepository(Role);

        RoleService.auditLog.info('Role updated: %j', role);
        await roleRepository.save(role);

        return true;
    }

    static async delete(role : Role) : Promise<boolean> {
        const roleRepository = MySQLService.connection.getRepository(Role);
        await roleRepository.delete(role.id);

        RoleService.auditLog.info('Role deleted: %j', role);
        
        return true;
    }
}