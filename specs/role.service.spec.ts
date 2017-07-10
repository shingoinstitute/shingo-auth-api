import { Expect, Test, AsyncTest, TestFixture, Setup, SpyOn, Any } from 'alsatian';
import { mock, instance, verify, when } from 'ts-mockito';
import { RoleService } from '../src/shared';
import { MySQLService } from '../src/database/mysql.service';
import { Role } from '../src/database/entities';
import { Connection, Repository, QueryBuilder } from 'typeorm';
import * as _ from 'lodash';

class MockQueryBuilder extends QueryBuilder<Role> {
    public leftJoinAndSelect(field : string, alias : string) : this {
        return this;
    }

    public where(clause : string, params? : any) : this {
        return this;
    }

    public getMany() : Promise<Role[]> {
        let roles : Role[] = [];
        for(let i of [1,2,3,4]) {
            let role = new Role();
            role.id = i;
            role.name = `${i} test role`;
            roles.push(role);
        }

        return Promise.resolve(roles);
    }
}

class MockRepo extends Repository<Role> {

    mockQueryBuilder : MockQueryBuilder;

    constructor(){
        super();
        this.mockQueryBuilder = new MockQueryBuilder(MySQLService.connection);
        SpyOn(this.mockQueryBuilder, 'leftJoinAndSelect');
        SpyOn(this.mockQueryBuilder, 'where');
        SpyOn(this.mockQueryBuilder, 'getMany');
    }

    public persist(role : Role, options? : any) : Promise<Role>;
    public persist(roles : Role[], options? : any) : Promise<Role[]>;

    public persist(r : Role | Role[], options? : any) : Promise<Role | Role[]> {
        if(r instanceof Role){
            r.id = 1;
        } else {
            let id = 1;
            for(let role of r) {
                role.id = id++;
            }
        }
        return Promise.resolve(r);
    }

    public removeById(id : number) : Promise<void>{
        return Promise.resolve();
    }

    public createQueryBuilder(alias : string, options? : any) : MockQueryBuilder {
        return this.mockQueryBuilder;
    }

}

@TestFixture('Role Service')
export class RoleServiceFixture {

    mockConn : Connection;

    @Setup
    public async Setup() {
        this.mockConn = mock(Connection);
        let mockRepo = new MockRepo();
        when(this.mockConn.getRepository(Role)).thenReturn(mockRepo);
        MySQLService.connection = instance(this.mockConn);

        SpyOn(MySQLService.connection, 'getRepository');
        SpyOn(mockRepo, 'persist');
        SpyOn(mockRepo, 'removeById');
        SpyOn(mockRepo, 'createQueryBuilder');
    }

    @AsyncTest('Create a role')
    public async create(){
        const role = new Role();
        role.name = 'test role';
        role.service = 'test';

        const result = await RoleService.create(role);
        Expect(result).toBeDefined();
        Expect(result.id).toBe(1);
        Expect(result.name).toBe(role.name);
        Expect(result.service).toBe(role.service);
        Expect(MySQLService.connection.getRepository(Role).persist)
            .toHaveBeenCalledWith(Any);
    }

    @AsyncTest('Read roles')
    public async read(){
        const clause = 'test=clause';
        const results = await RoleService.read(clause);

        Expect(results).toBeDefined();
        Expect(results.length).toBe(4);
        Expect(results[0].id).toBe(1);
        Expect(results[1].id).toBe(2);
        Expect(results[2].id).toBe(3);
        Expect(results[3].id).toBe(4);

        const repo = MySQLService.connection.getRepository(Role);
        Expect(repo.createQueryBuilder).toHaveBeenCalledWith('role');
        Expect(repo.createQueryBuilder('role').leftJoinAndSelect).toHaveBeenCalled().exactly(2).times;
        Expect(repo.createQueryBuilder('role').leftJoinAndSelect).toHaveBeenCalledWith('role.permissions', 'permissions');
        Expect(repo.createQueryBuilder('role').leftJoinAndSelect).toHaveBeenCalledWith('role.users', 'users');
        Expect(repo.createQueryBuilder('role').where).toHaveBeenCalledWith(clause);
        Expect(repo.createQueryBuilder('role').getMany).toHaveBeenCalled();
    }

    @AsyncTest('Update a role')
    public async update(){
        const role = new Role();
        role.id = 1;
        role.name = 'test role';
        role.service = 'test';

        const result = await RoleService.update(role);
        Expect(result).toBe(true);
        Expect(MySQLService.connection.getRepository(Role).persist)
            .toHaveBeenCalledWith(Any);
    }

    @AsyncTest('Delete a role')
    public async delete(){
        const role = new Role();
        role.id = 1;
        role.name = 'test role';
        role.service = 'test';

        const result = await RoleService.delete(role);
        Expect(result).toBe(true);
        Expect(MySQLService.connection.getRepository(Role).removeById)
            .toHaveBeenCalledWith(role.id);
    }
}