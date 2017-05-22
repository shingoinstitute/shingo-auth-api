import { Module } from 'nest.js';
import { AuthController } from './auth.controller';
import { MySQLService } from '../database/mysql.service'
import { UserService } from './user.service'
import 'rxjs';

@Module({
    controllers: [ AuthController ],
    components: [ MySQLService, UserService ]
})
export class LocalModule {}