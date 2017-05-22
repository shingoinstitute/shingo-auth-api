import { Component } from 'nest.js'
import { MySQLService }  from '../database/mysql.service'
import * as scrypt from 'scrypt';
import * as jwt from 'jwt-simple'

@Component()
export class UserService{

    constructor(private db : MySQLService){
        this.db = new MySQLService();
    }


    public async create(email : string, password : string){
        let user = await this.db.findUserByEmail(email);
        if(user !== undefined) return Promise.reject('User already exists')
        let auth = await this.db.createAuth(email, password);
        user = await this.db.createUser(auth,'');

        return Promise.resolve(user);
    }

    

    public async login(email : string, password : string){
        let user = await this.db.login(email, password)
        return Promise.resolve(user)
    }

    public async updateJWT(email : string){
        let user = await this.db.findUserByEmail(email)
        user.jwt = jwt.encode({user: email, expires: new Date(new Date().getTime() + 600000)}, MySQLService.jwtSecret)
        await this.db.saveUser(user);
        return Promise.resolve(user.jwt)
    }
   
}