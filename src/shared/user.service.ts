import { Auth, User, MySQLService } from '../database/mysql.service';
import * as scrypt from 'scrypt';
import * as jwt from 'jwt-simple';

export interface Credentials {
    username : string,
    password : string,
    services? : string
}

export class UserService {

    // Login a user if they have credentials
    static async login(creds : Credentials) : Promise<User> {
        const authRepository = MySQLService.connection.getRepository(Auth);
        let auth = await authRepository.createQueryBuilder('auth')
            .leftJoinAndSelect('auth.user', 'user')
            .leftJoinAndSelect('user.permissions', 'permissions')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('role.permissions', 'role.permissions')
            .where('auth.email=:email', {email: creds.username})
            .getOne();

        if(auth === undefined) return Promise.reject({error: "EMAIL_NOT_FOUND"});

        const matches = await scrypt.verifyKdf(new Buffer(auth.password, "base64"), creds.password);
        if(!matches) return Promise.reject({error: "INVALID_PASSWORD"});

        let user = auth.user;
        user.jwt = jwt.encode({user: user.id + ' '+ auth.email, expires: new Date(new Date().getTime() + 600000)}, MySQLService.jwtSecret);

        await MySQLService.connection.getRepository(User).persist(user);

        delete auth.password;
        delete auth.user;
        user.auth = auth;
        return Promise.resolve(user);
    }

    static async isValid(JWT : string) : Promise<boolean> {
        let userRepository = await MySQLService.connection.getRepository(User);

        let user = await userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.auth', 'auth')
            .where('user.jwt=:jwt', {jwt: JWT})
            .getOne();

        if(user === undefined) return Promise.reject({error: "USER_NOT_FOUND"});

        let decoded = jwt.decode(user.jwt, MySQLService.jwtSecret);
        if(decoded.user != user.id + ' ' + user.auth.email) return Promise.reject(false);
        if(new Date(decoded.expires) <= new Date()) return Promise.reject(false);
        
        return Promise.resolve(true);
    }

    static async create(creds : Credentials) : Promise<User> {
        let authRepository = await MySQLService.connection.getRepository(Auth);
        let userRepository = await MySQLService.connection.getRepository(User);

        let auth = await authRepository.findOne({ email: creds.username });
        if(auth !== undefined) return Promise.reject({error: "EMAIL_IN_USE"});
        auth = new Auth();
        auth.email = creds.username;
        auth.password = scrypt.kdfSync(creds.password, scrypt.paramsSync(0.1)).toString("base64");

        let user = new User();
        user.auth = auth;
        user.services = creds.services;
        user.jwt = jwt.encode({user: user.id + ' '+ auth.email, expires: new Date(new Date().getTime() + 600000)}, MySQLService.jwtSecret);
        auth.user = user;

        await authRepository.persist(auth);

        await userRepository.persist(user);

        delete user.auth.password;
        delete user.auth.user;
        return Promise.resolve(user);
    }

    static async update(user : User) : Promise<boolean> {
        let userRepository = await MySQLService.connection.getRepository(User);

        for(let key in user){
            if(user.hasOwnProperty(key) && user[key] == undefined || user[key] === '' || user[key] instanceof Array) delete user[key];
        }

        console.log('saving user: ', user);

        await userRepository.persist(user);

        return Promise.resolve(true);
    }

    static async get(JWT : string) : Promise<User> {
        let userRepository = await MySQLService.connection.getRepository(User);
        
        let user = await userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.permissions', 'permissions')
            .leftJoinAndSelect ('user.role', 'role')
            .where('user.jwt=:jwt', {jwt:JWT})
            .getOne();

        if(user === undefined) return Promise.reject({error: "USER_NOT_FOUND"});
        return Promise.resolve(user);
    }

    static async getByEmail(email : string) : Promise<User> {
        let userRepository = await MySQLService.connection.getRepository(User);
        
        let user = await userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.permissions', 'permissions')
            .leftJoinAndSelect ('user.role', 'role')
            .leftJoinAndSelect('user.auth', 'auth')
            .where('auth.email=:email', { email })
            .getOne();

        if(user === undefined) return Promise.reject({error: "USER_NOT_FOUND"});
        delete user.auth.user;
        delete user.auth.password;
        return Promise.resolve(user);
    }
}