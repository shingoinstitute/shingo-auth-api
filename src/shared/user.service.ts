import { LoggerService } from './logger.service';
import { User, MySQLService } from '../database/mysql.service';
import * as scrypt from 'scrypt';
import * as jwt from 'jsonwebtoken';
import _ from 'lodash';
import { NotFoundError } from '../util';


export interface Credentials {
    email: string,
    password: string,
    services?: string
}

export interface RoleOperation {
    userEmail: string,
    roleId: number
}

export class UserService {

    static auditLog = new LoggerService('auth-api.audit.log');

    static async create(creds: { email: string, password: string, services: string, extId: string }): Promise<_.Omit<User, 'password'>> {
        const userRepository = MySQLService.connection.getRepository(User);
        let user = new User();
        user.email = creds.email;
        user.password = (await scrypt.kdfSync(creds.password, scrypt.paramsSync(0.1))).toString("base64");
        user.services = creds.services;
        user.jwt = jwt.sign({ user: `${user.id}:${user.email}:${user.password}`, expires: new Date(new Date().getTime() + 600000) }, MySQLService.jwtSecret);
        user.extId = creds.extId;

        const created = await userRepository.save(user);
        const returned = { ... _.omit(created, ['password']), permissions: [], roles: [] }

        UserService.auditLog.info('User created: %j', returned);

        return returned;
    }

    static async read(clause: string): Promise<User[]> {
        const userRepository = MySQLService.connection.getRepository(User);
        try {
            let users = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.permissions', 'permissions')
                .leftJoinAndSelect('user.roles', 'roles')
                .leftJoinAndSelect('roles.permissions', 'roles.permissions')
                .where(clause)
                .getMany();

            return Promise.resolve(users);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async readOne(clause: string): Promise<User | undefined> {
        const userRepository = MySQLService.connection.getRepository(User);
        try {
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.permissions', 'permissions')
                .leftJoinAndSelect('user.roles', 'roles')
                .leftJoinAndSelect('roles.permissions', 'roles.permissions')
                .where(clause)
                .getOne();

            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async update(updateData: Partial<User>): Promise<boolean> {
        const userRepository = MySQLService.connection.getRepository(User);

        const existingUser = typeof updateData.id !== 'undefined'
            ? await userRepository.findOne(updateData.id)
            : await userRepository.findOne({ extId: updateData.extId });

        if (typeof existingUser === 'undefined') {
            throw typeof updateData.id !== 'undefined'
                ? new NotFoundError(`Id, ${updateData.id}, did not map to a user.`)
                : new NotFoundError(`External Id, ${updateData.extId}, did not map to a user.`);
        }

        const newPassword =
            typeof updateData.password !== 'undefined'
                ? { password: await scrypt.kdf(updateData.password, scrypt.paramsSync(0.1)).then(b => b.toString('base64')) }
                : {};

        const newJwt = typeof newPassword.password !== 'undefined'
            ? { jwt: jwt.sign({ user: `${existingUser.id}:${updateData.email || existingUser.email}:${newPassword}`, expires: new Date(new Date().getTime() + 600000) }, MySQLService.jwtSecret) }
            : {};

        const update = { ...updateData, id: existingUser.id, ...newPassword, ...newJwt }

        return userRepository.update(update.id, update).then(() => {
            UserService.auditLog.info('User updated: %j', update);
            return true;
        });
    }

    static async delete(user: User): Promise<boolean> {
        const userRepository = MySQLService.connection.getRepository(User);
        try {
            if (user.id === undefined && user.extId != undefined) {
                let oldUser = await userRepository.findOne({ extId: user.extId });
                if (oldUser === undefined) return Promise.reject({ error: 'USER_NOT_FOUND', message: `External Id, ${user.extId}, did not map to a user.` });
                user.id = oldUser.id;
            }

            if (user.email === '') return Promise.resolve(true);

            await userRepository.remove(user);

            UserService.auditLog.info('User deleted: %j', user);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async addRole(roleOp: RoleOperation): Promise<boolean> {
        const userEmail = roleOp.userEmail;
        const roleId = roleOp.roleId;
        const userRepository = MySQLService.connection.getRepository(User);
        UserService.auditLog.info('Trying to add role to user: %j', roleOp);
        
        try {
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.roles', 'roles')
                .where(`user.email='${userEmail}'`)
                .getOne();

            if (user === undefined) return Promise.reject({ error: 'EMAIL_NOT_FOUND' });

            delete user.permissions;

            user.roles.push(<any>{ id: roleId });
            await userRepository.save(user);
            UserService.auditLog.info('User role added: %j', roleOp);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async removeRole(roleOp: RoleOperation): Promise<boolean> {
        const userEmail = roleOp.userEmail;
        const roleId = roleOp.roleId;

        const userRepository = MySQLService.connection.getRepository(User);
        try {
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.roles', 'roles')
                .where(`user.email='${userEmail}'`)
                .getOne();

            if (user === undefined) return Promise.reject({ error: 'EMAIL_NOT_FOUND' });

            user.roles = user.roles.filter(role => { return role.id !== roleId; });

            delete user.permissions;

            await userRepository.save(user);
            UserService.auditLog.info('User role removed: %j', user);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

}