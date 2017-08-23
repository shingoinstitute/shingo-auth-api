import { User, MySQLService } from '../database/mysql.service';
import * as scrypt from 'scrypt';
import * as jwt from 'jwt-simple';
import * as _ from 'lodash';


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

    static async create(creds: User): Promise<User> {
        const userRepository = MySQLService.connection.getRepository(User);
        let user = new User();
        user.email = creds.email;
        user.password = scrypt.kdfSync(creds.password, scrypt.paramsSync(0.1)).toString("base64");
        user.services = creds.services;
        user.jwt = jwt.encode({ user: `${user.id}:${user.email}:${user.password}`, expires: new Date(new Date().getTime() + 600000) }, MySQLService.jwtSecret);
        user.extId = creds.extId;

        try {
            await userRepository.persist(user);
            user = _.omit(user, ['password']);
            user.roles = [];
            user.permissions = [];
            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
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

    static async readOne(clause: string): Promise<User> {
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

    static async update(user: User): Promise<boolean> {
        const userRepository = MySQLService.connection.getRepository(User);
        let update = _.omit(user, [
            'permissions',
            'roles',
            'password',
            'jwt'
        ]);

        Object.keys(update).forEach(key => (update[key] == '' || update[key] == undefined || update[key] == null) && delete update[key]);

        if (update.id === 0) delete update['id'];

        if (user.password) update.password = scrypt.kdfSync(user.password, scrypt.paramsSync(0.1)).toString("base64");

        try {
            let oldUser: User;
            if (user.id != undefined) {
                oldUser = await userRepository.findOneById(user.id);
                if (oldUser === undefined) return Promise.reject({ error: 'USER_NOT_FOUND', message: `Id, ${user.id}, did not map to a user.` });
            } else if (user.extId != undefined) {
                oldUser = await userRepository.findOne({ extId: user.extId });
                if (oldUser === undefined) return Promise.reject({ error: 'USER_NOT_FOUND', message: `External Id, ${user.extId}, did not map to a user.` });
            }
            update.id = oldUser.id;
            if (!update.isEnabled) update.isEnabled = oldUser.isEnabled;
            if (!update.password) update.password = oldUser.password;
            if (!update.email) update.email = oldUser.email;
            if (!update.services) update.services = oldUser.services;
            if (!update.extId) update.extId = oldUser.extId;

            if (user.password) update.jwt = jwt.encode({ user: `${update.id}:${update.email}:${update.password}`, expires: new Date(new Date().getTime() + 600000) }, MySQLService.jwtSecret);
            await userRepository.persist(update);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
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

            await userRepository.removeById(user.id);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async addRole(roleOp: RoleOperation): Promise<boolean> {
        const userEmail = roleOp.userEmail;
        const roleId = roleOp.roleId;
        const userRepository = MySQLService.connection.getRepository(User);

        try {
            let user = await userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.roles', 'roles')
                .where(`user.email='${userEmail}'`)
                .getOne();

            if (user === undefined) return Promise.reject({ error: 'EMAIL_NOT_FOUND' });

            delete user.permissions;

            user.roles.push(<any>{ id: roleId });
            await userRepository.persist(user);
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

            await userRepository.persist(user);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

}