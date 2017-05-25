import { Component } from 'nest.js';
import 'reflect-metadata';
import * as scrypt from 'scrypt';
import { createConnection, Connection } from 'typeorm';
import { UserDriver } from './user.driver';
import { PermissionDriver } from './permission.driver';
import { Auth, Permission, Role, User, Level } from './entities';

export { Auth, Permission, Role, User, Level };

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

    /*  USER ACTIONS */

    public async getUserByJWT(JWT : string){
        return UserDriver.getByJWT(MySQLService.connection, JWT);
    }


    public async login(email : string, password : string){
        return UserDriver.login(MySQLService.connection, email, password);
    }

    public async createAuth(email : string, password : string){
        return UserDriver.createAuth(MySQLService.connection, email, password);
    }

    public async createUser(auth : Auth, JWT : string){
        return UserDriver.createUser(MySQLService.connection, auth, JWT);
    }

    public async saveUser(user : User){
        return UserDriver.saveUser(MySQLService.connection, user);
    }

    public async findUserByEmail(email : string){
        return UserDriver.findUserByEmail(MySQLService.connection, email);
    }

    /* PERMISSION ACTIONS */

    public async getPermissionsByRoleAndResource(roleId : number, resource : string){
        return PermissionDriver.getPermissionsByRoleAndResource(MySQLService.connection, roleId, resource);
    }

    public async createPermission(resource : string, level : Level){
        return PermissionDriver.create(MySQLService.connection, resource, level);
    }

    public async grantPermission(userId : number, permissionId : number){
        return PermissionDriver.grant(MySQLService.connection, userId, permissionId);
    }

    public async findPermission(resource : string, level : Level){
        return PermissionDriver.find(MySQLService.connection, resource, level);
    }
}