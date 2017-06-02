import { createConnection, Connection } from 'typeorm';
import { Auth, Permission, Role, User, Level } from './entities';

export { Auth, Permission, Role, User, Level };

export class MySQLService{

    public static jwtSecret = (process.env.JWT_SECRET || 'ilikecatz');

    public static connection : Connection;

    public static init(){
        if(MySQLService.connection === undefined){
            createConnection({driver: {
                    type: 'mysql',
                    host: process.env.MYSQL_URL || 'localhost',
                    port: process.env.MYSQL_PORT || 3306,
                    username: process.env.MYSQL_AUTH_USER,
                    password: process.env.MYSQL_AUTH_PASS,
                    database: process.env.MYSQL_AUTH_DB || 'authDb'
                },
                entities: [
                    Auth,
                    Permission,
                    Role,
                    User
                ],
                autoSchemaSync: true
            }).then(connection => {
                MySQLService.connection = connection;
            }).catch(error => console.error(error))
        }

    }
}