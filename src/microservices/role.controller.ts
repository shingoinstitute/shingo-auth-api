import { Dependencies, Controller } from 'nest.js';
import { MessagePattern } from 'nest.js/microservices';
import { MySQLService } from '../database/mysql.service'
import * as jwt from 'jwt-simple';

@Controller()
export class RoleController {

    constructor(private db : MySQLService){
        this.db = db;
    }

    @MessagePattern({ cmd: 'findRole' })
    public async find(data, respond){
        console.log('Finding role for ', data.role);
        try{
            let role = await this.db.findRoleByName(data.role);
            if(role === undefined) return respond({error: "Role not found!"});
            respond(null, role);
        } catch (error) {
            respond(error);
        }
    }

}