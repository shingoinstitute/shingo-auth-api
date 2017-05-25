import { Connection } from 'typeorm';
import { User, Auth } from './entities';
import * as scrypt from 'scrypt';

export class UserDriver {
    static async getByJWT(connection : Connection, jwt : string){
        let userRepo = connection.getRepository(User)
        let user = await userRepo.createQueryBuilder('user')
                            .leftJoinAndSelect("user.permissions", "permissions")
                            .where(`user.jwt='${jwt}'`)
                            .getOne();

        return Promise.resolve(user)
    }

    static async login(connection : Connection, email : string, password : string){
        let authRepo = connection.getRepository(Auth)

        let auth = await authRepo.findOne({ email })

        if( auth === undefined) return Promise.resolve()

        console.log(`auth.password = ${auth.password}`)

        let matches = await scrypt.verifyKdf(new Buffer(auth.password, "base64"), password)

        auth = await authRepo.createQueryBuilder('auth')
                                .innerJoinAndSelect('auth.user', 'user')
                                .where(`auth.id=${auth.id}`)
                                .getOne();

        if(matches) return Promise.resolve(auth.user);
        return Promise.resolve();
    }

    static async createAuth(connection : Connection, email : string, password : string){
        let authRepo = connection.getRepository(Auth)

        let auth = new Auth();
        auth.email = email;
        auth.password = scrypt.kdfSync(password, scrypt.paramsSync(0.1)).toString("base64");

        await authRepo.persist(auth);       
        
        auth = await authRepo.findOne({email: auth.email, password: auth.password})
        return Promise.resolve(auth)
    }

    static async createUser(connection : Connection, auth : Auth, JWT : string){
        let userRepo = connection.getRepository(User)
        let user = new User();
        user.auth = auth;
        user.jwt = JWT;

        await userRepo.persist(user);

        user = await userRepo.findOne({ jwt : JWT })
        return Promise.resolve(user)
    }

    static async saveUser(connection : Connection, user : User){
        let userRepo = connection.getRepository(User)
        delete user.permissions
        await userRepo.persist(user)
        return Promise.resolve(user)
    }

    static async findUserByEmail(connection : Connection, email : string){
        let authRepo = connection.getRepository(Auth);
        let auth = await authRepo.createQueryBuilder('auth')
                        .innerJoinAndSelect('auth.user', 'user')
                        .where(`auth.email='${email}'`)
                        .getOne();

        return Promise.resolve(auth.user)
    }
}