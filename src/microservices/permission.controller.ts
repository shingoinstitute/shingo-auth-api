import { Dependencies, Controller } from 'nest.js';
import { MessagePattern } from 'nest.js/microservices';
import { MySQLService } from '../database/mysql.service'
import { Level } from '../database/entities/Permission'
import * as jwt from 'jwt-simple';

@Controller()
export class PermissionController {

    constructor(private db : MySQLService){
        this.db = db;
    }

    @MessagePattern({ cmd: 'create' })
    public async create(data, respond){
        let permission = await this.db.createPermission(data.resource, data.level);
        if(permission === undefined) return respond({error: "Permission not created!"});
        respond(null, permission);
    }

    @MessagePattern({ cmd: 'grant' })
    public async grant(data, respond){
        let permission = await this.db.findPermission(data.resource, data.level);
        if(permission === undefined){
            permission = await this.db.createPermission(data.resource, data.level);
        }
        if(permission === undefined) return respond({error: "Permission not found or created!"});

        let permissionSet = await this.db.grantPermission(data.userId, permission.id);

        respond(null, permissionSet);
    }

}