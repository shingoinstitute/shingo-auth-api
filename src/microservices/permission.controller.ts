import { Dependencies, Controller } from 'nest.js';
import { MessagePattern } from 'nest.js/microservices';
import { MySQLService } from '../database/mysql.service'
import * as jwt from 'jwt-simple';

@Controller()
export class PermissionController {

    constructor(private db : MySQLService){
        this.db = db;
    }

    @MessagePattern({ cmd: 'createPermission' })
    public async create(data, respond){
        let permission = await this.db.createPermission(data.resource, data.level);
        if(permission === undefined) return respond({error: "Permission not created!"});
        respond(null, permission);
    }

    @MessagePattern({ cmd: 'grantPermission' })
    public async grant(data, respond){
        try{
            let permission = await this.db.findPermission(data.resource, data.level);
            if(permission === undefined){
                permission = await this.db.createPermission(data.resource, data.level);
            }
            if(permission === undefined) return respond({error: "Permission not found or created!"});

            let isRole = (data.isRole === undefined ? false : data.isRole);

            let permissionSet = await this.db.grantPermission(data.userId, permission.id, isRole);


            console.log('responding with permission set', permissionSet);

            respond(null, permissionSet);
        } catch (error) {
            respond(error);
        }
    }

    @MessagePattern({ cmd: 'permissionLike' })
    public async permissionLike(data, respond){
        let permissions = await this.db.findPermissions(data.resource, data.level);
        respond(null, permissions);
    }

}