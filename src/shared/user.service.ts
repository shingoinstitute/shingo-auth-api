import { User, MySQLService } from '../database/mysql.service';
import * as scrypt from 'scrypt';
import * as jwt from 'jwt-simple';
import * as _ from 'lodash';


export interface Credentials {
    email : string,
    password : string,
    services? : string
}

export class UserService {

    static async create(creds : Credentials) : Promise<User> {
        const userRepository = MySQLService.connection.getRepository(User);
        let user = new User();
        user.email = creds.email;
        user.password = scrypt.kdfSync(creds.password, scrypt.paramsSync(0.1)).toString("base64");
        user.services = creds.services;

        try {
            await userRepository.persist(user);
            user = _.omit(user, [ 'password' ]);
            return Promise.resolve(user);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async read(clause : string) : Promise<User[]> {
        const userRepository = MySQLService.connection.getRepository(User);
        try{
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

    static async update(user : User) : Promise<boolean> {
        const userRepository = MySQLService.connection.getRepository(User);
        let update = _.omit(user, [
            'permissions',
            'roles',
            'password'
        ]);

        if(user.password) update.password = scrypt.kdfSync(user.password, scrypt.paramsSync(0.1)).toString("base64");

        try {
            await userRepository.persist(update);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    static async delete(user : User) : Promise<boolean> {
        const userRepository = MySQLService.connection.getRepository(User);
        try {
            await userRepository.removeById(user.id);

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }

}