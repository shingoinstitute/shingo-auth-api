import { Module } from 'nest.js';
import { LocalModule } from './local/local.module';
import { AuthController, PermissionController, RoleController } from './microservices';
import { MySQLService } from './database/mysql.service'
import 'rxjs';

@Module({
    controllers: [ AuthController, PermissionController, RoleController ],
    components: [ MySQLService ]
})
export class MicroservicesModule {}