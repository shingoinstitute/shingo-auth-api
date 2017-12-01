import { LoggerService } from './logger.service';
import { Role, MySQLService } from '../database/mysql.service';
import * as _ from 'lodash';

export class RoleService {

    static auditLog = new LoggerService('auth-api.audit.log');

    static async create(role : Role) : Promise<Role> {
        const roleRepository = MySQLService.connection.getRepository(Role);
        if(role.id) role = _.omit(role, [
            'id'
        ]);

        try {
            await roleRepository.persist(role);
            RoleService.auditLog.info('Role created: %j', role);
            return Promise.resolve(role);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async read(clause : string) : Promise<Role[]> {
        const roleRepository = MySQLService.connection.getRepository(Role);
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

    static async readOne(clause : string) : Promise<Role> {
        const roleRepository = MySQLService.connection.getRepository(Role);
        try {
            let role = await roleRepository.createQueryBuilder('role')
                .leftJoinAndSelect('role.permissions', 'permissions')
                .leftJoinAndSelect('role.users', 'users')
                .where(clause)
                .getOne();

            return Promise.resolve(role);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(role : Role) : Promise<boolean> {
        const roleRepository = MySQLService.connection.getRepository(Role);
        let update = _.omit(role, [
            'permissions',
            'users'
        ]);

        RoleService.auditLog.info('Role updated: %j', role);
        
        try {
            await roleRepository.persist(role);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(role : Role) : Promise<boolean> {
        const roleRepository = MySQLService.connection.getRepository(Role);
        try {
            await roleRepository.removeById(role.id);

            RoleService.auditLog.info('Role deleted: %j', role);
            
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}