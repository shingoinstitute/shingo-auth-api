import { Expect, TestFixture, Test, AsyncSetup, SpyOn } from 'alsatian';
import { MySQLService } from '../src/database/mysql.service';

@TestFixture("MySQL Service")
export class MySQLServiceFixture {

    @AsyncSetup
    public async Setup() {
        await MySQLService.init();
    }

    @Test("Connection is created")
    public connection() {
        Expect(MySQLService.connection).toBeDefined();
    }
}