import { Component } from 'nest.js'
import 'reflect-metadata';
import * as scrypt from 'scrypt'
import { createConnection, Connection } from 'typeorm'
import { Auth } from './entities/Auth'
import { Permission } from './entities/Permission'
import { Role } from './entities/Role'
import { User } from './entities/User'

@Component()
export class MySQLService{

    public static jwtSecret = (process.env.JWT_SECRET || 'ilikecatz');

    private static connection;

    constructor(){
        if(MySQLService.connection === undefined){
            createConnection({driver: {
                    type: 'mysql',
                    host: process.env.MYSQL_URL || 'localhost',
                    port: process.env.MYSQL_PORT || 3306,
                    username: process.env.MYSQL_AUTH_USER,
                    password: process.env.MYSQL_AUTH_PASS,
                    database: process.env.MYSQL_AUTH_DB || 'authDb'
                },
                entities: [
                    Auth,
                    Permission,
                    Role,
                    User
                ],
                autoSchemaSync: true
            }).then(connection => {
                MySQLService.connection = connection;
            }).catch(error => console.error(error))
        }

    }

    public async getUserByJWT(JWT : string){
        let userRepo = MySQLService.connection.getRepository(User)
        let user = await userRepo.createQueryBuilder('user')
                            .leftJoinAndSelect("user.permissions", "permissions")
                            .where(`user.jwt='${JWT}'`)
                            .getOne();

        return Promise.resolve(user)
    }

    public async getPermissionsByRoleAndResource(roleId : number, resource : string){
        let permissionRepo = MySQLService.connection.getRepository(Permission)

        let permissions = await permissionRepo.createQueryBuilder("permission")
                            .leftJoinAndSelect("permission.roles", "roles", `roles.id=${roleId}`)
                            .where(`permission.resource=${resource}`)
                            .getMany();
        return Promise.resolve(permissions);
    }

    public async login(email : string, password : string){
        let authRepo = MySQLService.connection.getRepository(Auth)

        let auth = await authRepo.findOne({ email })

        if( auth === undefined) return Promise.resolve()

        console.log(`auth.password = ${auth.password}`)

        let matches = await scrypt.verifyKdf(new Buffer(auth.password, "base64"), password)

        auth = await authRepo.createQueryBuilder('auth')
                                .innerJoinAndSelect('auth.user', 'user')
                                .where(`auth.id=${auth.id}`)
                                .getOne();

        if(matches) return Promise.resolve(auth.user);
        return Promise.resolve();
    }

    public async createAuth(email : string, password : string){
        let authRepo = MySQLService.connection.getRepository(Auth)

        let auth = new Auth();
        auth.email = email;
        auth.password = scrypt.kdfSync(password, scrypt.paramsSync(0.1)).toString("base64");

        await authRepo.persist(auth);       
        
        auth = await authRepo.findOne({email: auth.email, password: auth.password})
        return Promise.resolve(auth)
    }

    public async createUser(auth : Auth, JWT : string){
        let userRepo = MySQLService.connection.getRepository(User)
        let user = new User();
        user.auth = auth;
        user.jwt = JWT;

        await userRepo.persist(user);

        user = await userRepo.findOne({ jwt : JWT })
        return Promise.resolve(user)
    }

    public async saveUser(user : User){
        let userRepo = MySQLService.connection.getRepository(User)
        delete user.permissions
        await userRepo.persist(user)
        return Promise.resolve(user)
    }

    public async findUserByEmail(email : string){
        let authRepo = MySQLService.connection.getRepository(Auth);
        let auth = await authRepo.createQueryBuilder('auth')
                        .innerJoinAndSelect('auth.user', 'user')
                        .where(`auth.email='${email}'`)
                        .getOne();

        if( auth === undefined) return Promise.resolve();

        return Promise.resolve(auth.user)
    }
}