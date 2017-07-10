import { Expect, Test, AsyncTest, TestFixture, Setup, SpyOn, Any } from 'alsatian';
import { mock, instance, verify, when } from 'ts-mockito';
import { PermissionService } from '../src/shared';
import { MySQLService } from '../src/database/mysql.service';
import { Permission } from '../src/database/entities';
import { Connection, Repository, QueryBuilder } from 'typeorm';
import * as _ from 'lodash';

class MockQueryBuilder extends QueryBuilder<Permission> {
    public leftJoinAndSelect(field : string, alias : string) : this {
        return this;
    }

    public where(clause : string, params? : any) : this {
        return this;
    }

    public getMany() : Promise<Permission[]> {
        let permissions : Permission[] = [];
        for(let i of [1,2,3,4]) {
            let permission = new Permission();
            permission.id = i;
            permission.resource = `${i} resource`;
            permission.level = 2;
            permissions.push(permission);
        }

        return Promise.resolve(permissions);
    }
}

class MockRepo extends Repository<Permission> {

    mockQueryBuilder : MockQueryBuilder;

    constructor(){
        super();
        this.mockQueryBuilder = new MockQueryBuilder(MySQLService.connection);
        SpyOn(this.mockQueryBuilder, 'leftJoinAndSelect');
        SpyOn(this.mockQueryBuilder, 'where');
        SpyOn(this.mockQueryBuilder, 'getMany');
    }

    public persist(permission : Permission, options? : any) : Promise<Permission>;
    public persist(permissions : Permission[], options? : any) : Promise<Permission[]>;

    public persist(u : Permission | Permission[], options? : any) : Promise<Permission | Permission[]> {
        if(u instanceof Permission){
            u.id = 1;
        } else {
            let id = 1;
            for(let permission of u) {
                permission.id = id++;
            }
        }
        return Promise.resolve(u);
    }

    public removeById(id : number) : Promise<void>{
        return Promise.resolve();
    }

    public createQueryBuilder(alias : string, options? : any) : MockQueryBuilder {
        return this.mockQueryBuilder;
    }

}

@TestFixture('Permission Service')
export class PermissionServiceFixture {

    mockConn : Connection;

    @Setup
    public async Setup(){
        this.mockConn = mock(Connection);
        let mockRepo = new MockRepo();
        when(this.mockConn.getRepository(Permission)).thenReturn(mockRepo);
        MySQLService.connection = instance(this.mockConn);

        SpyOn(MySQLService.connection, 'getRepository');
        SpyOn(mockRepo, 'persist');
        SpyOn(mockRepo, 'removeById');
        SpyOn(mockRepo, 'createQueryBuilder');
    }

    @AsyncTest('Create a permission')
    public async create(){
        const permission = new Permission();
        permission.resource = 'test resource';
        permission.level = 2;

        const result = await PermissionService.create(permission);
        Expect(result).toBeDefined();
        Expect(result.id).toBe(1);
        Expect(result.resource).toBe(permission.resource);
        Expect(result.level).toBe(permission.level);
        Expect(MySQLService.connection.getRepository(Permission).persist)
            .toHaveBeenCalledWith(Any);
    }

    @AsyncTest('Read permissions')
    public async read(){
        const clause = 'test=clause';
        const results = await PermissionService.read(clause);
        
        Expect(results).toBeDefined();
        Expect(results.length).toBe(4);
        Expect(results[0].id).toBe(1);
        Expect(results[1].id).toBe(2);
        Expect(results[2].id).toBe(3);
        Expect(results[3].id).toBe(4);

        const repo = MySQLService.connection.getRepository(Permission);
        Expect(repo.createQueryBuilder).toHaveBeenCalledWith('permission');
        Expect(repo.createQueryBuilder('permission').leftJoinAndSelect).toHaveBeenCalled().exactly(2).times;
        Expect(repo.createQueryBuilder('permission').leftJoinAndSelect).toHaveBeenCalledWith('permission.users', 'users');
        Expect(repo.createQueryBuilder('permission').leftJoinAndSelect).toHaveBeenCalledWith('permission.roles', 'roles');
        Expect(repo.createQueryBuilder('permission').where).toHaveBeenCalledWith(clause);
        Expect(repo.createQueryBuilder('permission').getMany).toHaveBeenCalled();
    }

    @AsyncTest('Update a permission')
    public async update(){
        const permission = new Permission();
        permission.id = 1;
        permission.resource = 'test resource';
        permission.level = 2;

        const result = await PermissionService.update(permission);
        Expect(result).toBe(true);
        Expect(MySQLService.connection.getRepository(Permission).persist)
            .toHaveBeenCalledWith(Any);
    }

    @AsyncTest('Delete a permission')
    public async delete(){
        const permission = new Permission();
        permission.id = 1;
        permission.resource = 'test resource';
        permission.level = 2;

        const result = await PermissionService.delete(permission);
        Expect(result).toBe(true);
        Expect(MySQLService.connection.getRepository(Permission).removeById)
            .toHaveBeenCalledWith(permission.id);
    }
}