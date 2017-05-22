import { Dependencies, Controller } from 'nest.js';
import { MessagePattern } from 'nest.js/microservices';
import { MySQLService } from './database/mysql.service'
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

        return Promise.resolve(true)
    }

    @MessagePattern({ cmd: 'isValid' })
    public async isValid(data, respond){
        let valid = await this.validJWT(data)
    
        respond(null, valid)
    }

    @MessagePattern({ cmd: 'canAccess' })
    public async canAccess(data, respond){
        let valid = await this.validJWT(data.jwt)

        if(valid) {
            console.log('JWT is valid')
            
            let user = await this.db.getUserByJWT(data.jwt);
            console.log(`Found user ${JSON.stringify(user)}`)
            let permission = user.permissions.find(p => p.resource === data.resource);

            if(!permission && user.role !== undefined){
                let rolePermissions = await this.db.getPermissionsByRoleAndResource(user.role.id, data.resource)
                rolePermissions.forEach(element => {
                    if(element.level >= data.level) return respond(null, true)
                })

                return respond(null, false)
            }

            if(!permission || permission.level === 0){
                return respond(null, false)
            } else if(permission.level >= data.level){
                console.log(`Has permission ${JSON.stringify(permission)} with level >= ${data.level}`)
                return respond(null ,true)
            }
        }

        console.log('JWT is not valid')
        respond(null, false)
    }

}