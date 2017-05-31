import { Controller,
        Get, Post, Put, Delete,
        HttpStatus, Request, Response, Next,
        Param, Query, Headers, Body, Transport
    } from 'nest.js'

import { UserService } from './user.service'
import { MySQLService } from '../database/mysql.service'

@Controller('local')
export class AuthController {


    constructor(private users : UserService){
        this.users = new UserService(new MySQLService())
    }

    @Post('auth')
    public async auth(@Request() req, @Response() res, @Next() next, @Body('username') username, @Body('password') password){
        if(!username || !password){
            return res.status(HttpStatus.BAD_REQUEST)
                .json({error: 'Missing important parameters!'})
        }

        let user = await this.users.login(username, password);
        if(user === undefined){
            return res.status(HttpStatus.FORBIDDEN)
                .json({error: 'Invalid username or password!'})
        }

        let token = await this.users.updateJWT(username);
        user = await this.users.get(username);
        res.status(HttpStatus.OK)
            .json({user});
    }

    @Post('create')
    public async create(@Request() req, @Response() res, @Next() next, @Body('username') username, @Body('password') password){
        if(!username || !password){
            return res.status(HttpStatus.BAD_REQUEST)
                .json({error: 'Missing important parameters!'})
        }

        let user = await this.users.create(username, password)
        if(user === undefined){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({error: `User ${username} was not created...`})
        }

        let token = await this.users.updateJWT(username)
        res.status(HttpStatus.OK)
            .json({jwt: token})
    }
    
}