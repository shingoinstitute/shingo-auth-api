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
            if (!process.env.MYSQL_AUTH_USER || !process.env.MYSQL_AUTH_PASS) {
                throw new Error('Missing Environment Variables')
            }

            try {
                const port = process.env.MYSQL_PORT && parseInt(process.env.MYSQL_PORT, 10) || 3306
                MySQLService.connection = await createConnection({
                    type: 'mysql',
                    host: process.env.MYSQL_URL || 'localhost',
                    port,
                    username: process.env.MYSQL_AUTH_USER,
                    password: process.env.MYSQL_AUTH_PASS,
                    database: process.env.MYSQL_AUTH_DB || 'shingoauth',
                    entities: [
                        Permission,
                        Role,
                        User
                    ],
                    synchronize: process.env.NODE_ENV !== 'production'
                } as ConnectionOptions);
                return MySQLService.connection;
            } catch (error) {
                MySQLService.log.error('Error in MySQLService.init(): %j', error);
                throw error;
            }
        }

    }
}