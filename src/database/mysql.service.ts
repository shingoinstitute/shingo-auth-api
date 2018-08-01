import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import { Permission, Role, User, Level } from './entities';
import { LoggerService } from '../shared/logger.service';

export { Permission, Role, User, Level };

export class MySQLService {

    private static log = new LoggerService();

    public static jwtSecret = (process.env.JWT_SECRET || 'ilikecatz');

    public static connection: Connection;

    public static async init() {
        if (MySQLService.connection === undefined) {
            try {
                MySQLService.connection = await createConnection({
                    driver: {
                        type: 'mysql',
                        host: process.env.MYSQL_URL || 'localhost',
                        port: process.env.MYSQL_PORT || 3306,
                        username: process.env.MYSQL_AUTH_USER,
                        password: process.env.MYSQL_AUTH_PASS,
                        database: process.env.MYSQL_AUTH_DB || 'authDb'
                    },
                    entities: [
                        Permission,
                        Role,
                        User
                    ],
                    autoSchemaSync: process.env.NODE_ENV !== 'production'
                } as ConnectionOptions);
                return MySQLService.connection;
            } catch (error) {
                MySQLService.log.error('Error in MySQLService.init(): %j', error);
                throw error;
            }
        }

    }
}