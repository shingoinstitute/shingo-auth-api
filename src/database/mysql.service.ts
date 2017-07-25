import { createConnection, Connection } from 'typeorm';
import { Permission, Role, User, Level } from './entities';

export { Permission, Role, User, Level };

export class MySQLService {

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
                });
                return Promise.resolve();
            } catch (error) {
                console.error('Error in MySQLService.init()', error);
                return Promise.reject(error);
            }
        }

    }
}