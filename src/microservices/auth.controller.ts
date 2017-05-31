import { Dependencies, Controller } from 'nest.js';
import { MessagePattern } from 'nest.js/microservices';
import { MySQLService } from '../database/mysql.service'
import { Level } from '../database/entities/Permission'
import * as jwt from 'jwt-simple';

@Controller()
export class AuthController {

    constructor(private db : MySQLService){
        this.db = db;
    }

    private async validJWT(JWT : string) {
        let user = await this.db.getUserByJWT(JWT);
        if(user === undefined || JWT !== user.jwt) return Promise.resolve(false)

        var decode = jwt.decode(user.jwt, MySQLService.jwtSecret);
        console.log('jwt expires: ', decode.expires)
        if(new Date(decode.expires) <= new Date()) return Promise.resolve(false)

        return Promise.resolve(true);
    }

    @MessagePattern({ cmd: 'isValid' })
    public async isValid(data, respond){
        let valid = await this.validJWT(data)
    
        respond(null, valid)
    }

    @MessagePattern({ cmd: 'getPermissions' })
    public async getPermissions(data, respond){
        try{
            let user = await this.db.findUserByEmail(data.email);
            if(user === undefined) respond({error: "User not found!"});
            respond(null, user.permissions);
        } catch (error) {
            console.error(`Error in AuthController.getPermissions(): ${error}`);
            respond(error);
        }
    }

    @MessagePattern({ cmd: 'canAccess' })
    public async canAccess(data, respond){
        let valid = await this.validJWT(data.jwt)

        if(valid) {
            console.log('JWT is valid')
            
            let user = await this.db.getUserByJWT(data.jwt);

            if(user.role !== undefined){
                let role = await this.db.getRoleWithPermissions(user.role.id);
                user.permissions.concat(role.permissions);
            }

            user.permissions.forEach(p => {
                if(p.level === Level.Deny) return respond(null, false);
            })

            let permissions = user.permissions.filter(p => p.resource === data.resource);
            permissions.sort((a,b) => { return b.level - a.level });
            let permission = permissions[0];

            if(!permission){
                return respond(null, false)
            } else if(permission.level >= data.level){
                console.log(`Has permission ${permission} with level >= ${data.level}`)
                return respond(null ,true)
            }
        }

        console.log('JWT is not valid')
        respond(null, false)
    }

}