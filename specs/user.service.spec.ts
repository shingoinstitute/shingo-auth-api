import { Expect, Test, AsyncTest, TestFixture, Setup, SpyOn, Any } from 'alsatian';
import { mock, instance, verify, when } from 'ts-mockito';
import { UserService } from '../src/shared';
import { MySQLService } from '../src/database/mysql.service';
import { User } from '../src/database/entities';
import { Connection, Repository, QueryBuilder } from 'typeorm';
import * as _ from 'lodash';

class MockQueryBuilder extends QueryBuilder<User> {
    public leftJoinAndSelect(field : string, alias : string) : this {
        return this;
    }

    public where(clause : string, params? : any) : this {
        return this;
    }

    public getMany() : Promise<User[]> {
        let users : User[] = [];
        for(let i of [1,2,3,4]) {
            let user = new User();
            user.id = i;
            user.email = `${i}@example.com`;
            user.services = 'test';
            users.push(user);
        }

        return Promise.resolve(users);
    }
}

class MockRepo extends Repository<User> {

    mockQueryBuilder : MockQueryBuilder;

    constructor(){
        super();
        this.mockQueryBuilder = new MockQueryBuilder(MySQLService.connection);
        SpyOn(this.mockQueryBuilder, 'leftJoinAndSelect');
        SpyOn(this.mockQueryBuilder, 'where');
        SpyOn(this.mockQueryBuilder, 'getMany');
    }

    public persist(user : User, options? : any) : Promise<User>;
    public persist(users : User[], options? : any) : Promise<User[]>;

    public persist(u : User | User[], options? : any) : Promise<User | User[]> {
        if(u instanceof User){
            u.id = 1;
        } else {
            let id = 1;
            for(let user of u) {
                user.id = id++;
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

@TestFixture('User Service')
export class UserServiceFixture {

    mockConn : Connection;

    @Setup
    public Setup(){
        this.mockConn = mock(Connection);
        let mockRepo = new MockRepo();
        when(this.mockConn.getRepository(User)).thenReturn(mockRepo);
        MySQLService.connection = instance(this.mockConn);

        SpyOn(MySQLService.connection, 'getRepository');
        SpyOn(mockRepo, 'persist');
        SpyOn(mockRepo, 'removeById');
        SpyOn(mockRepo, 'createQueryBuilder');
    }

    @AsyncTest('Create a user')
    public async create(){
        const user = new User();
        user.email = 'test.email@example.com';
        user.services = 'test';
        user.password = 'password';

        const result = await UserService.create(user);
        Expect(result).toBeDefined();
        Expect(result.id).toBe(1);
        Expect(result.email).toBe(user.email);
        Expect(result.password).not.toBeDefined();
        Expect(MySQLService.connection.getRepository(User).persist)
            .toHaveBeenCalledWith(Any);
    }

    @AsyncTest('Read users')
    public async read(){
        const clause = 'test=clause';
        const results = await UserService.read(clause);
        
        Expect(results).toBeDefined();
        Expect(results.length).toBe(4);
        Expect(results[0].id).toBe(1);
        Expect(results[1].id).toBe(2);
        Expect(results[2].id).toBe(3);
        Expect(results[3].id).toBe(4);

        const repo = MySQLService.connection.getRepository(User);
        Expect(repo.createQueryBuilder).toHaveBeenCalledWith('user');
        Expect(repo.createQueryBuilder('user').leftJoinAndSelect).toHaveBeenCalled().exactly(3).times;
        Expect(repo.createQueryBuilder('user').leftJoinAndSelect).toHaveBeenCalledWith('user.permissions', 'permissions');
        Expect(repo.createQueryBuilder('user').leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'roles');
        Expect(repo.createQueryBuilder('user').leftJoinAndSelect).toHaveBeenCalledWith('roles.permissions', 'roles.permissions');
        Expect(repo.createQueryBuilder('user').where).toHaveBeenCalledWith(clause).exactly(1).times;
        Expect(repo.createQueryBuilder('user').getMany).toHaveBeenCalled().exactly(1).times;
    }

    @AsyncTest('Update a user')
    public async update(){
        const user = new User();
        user.id = 1;
        user.email = 'test.email@example.com';
        user.services = 'test';

        const result = await UserService.update(user);
        Expect(result).toBe(true);
        Expect(MySQLService.connection.getRepository(User).persist)
            .toHaveBeenCalledWith(Any);
    }

    @AsyncTest('Delete a user')
    public async delete(){
        const user = new User();
        user.id = 1;
        user.email = 'test.email@example.com';
        user.services = 'test';
        user.password = 'password';

        const result = await UserService.delete(user);
        Expect(result).toBe(true);
        Expect(MySQLService.connection.getRepository(User).removeById)
            .toHaveBeenCalledWith(user.id);
    }

}