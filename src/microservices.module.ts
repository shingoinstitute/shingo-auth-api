import { Module } from 'nest.js';
import { LocalModule } from './local/local.module';
import { AuthController } from './auth.controller';
import { MySQLService } from './database/mysql.service'
import 'rxjs';

@Module({
    controllers: [ AuthController ],
    components: [ MySQLService ]
})
export class MicroservicesModule {}