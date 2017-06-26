import { AuthMicroservice } from './microservices/auth.microservice';
import * as grpc from 'grpc';

const microservice = new AuthMicroservice();
const port = process.env.PORT || 8888;

let server = new grpc.Server();
server.addService(microservice.authServices.AuthServices.service, {
    login: microservice.login,
    isValid: microservice.isValid,
    createUser: microservice.createUser,
    getUser: microservice.getUser,
    getUserByEmail: microservice.getUserByEmail,
    updateUser: microservice.updateUser,
    canAccess: microservice.canAccess,
    createPermission: microservice.createPermission,
    grantPermission: microservice.grantPermission,
    revokePermission: microservice.revokePermission,
    removePermission: microservice.removePermission,
    createRole: microservice.createRole,
    getRole: microservice.getRole,
    getRoles: microservice.getRoles
});

server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
server.start();
console.log(`AuthMicroservice is listening on port ${port}.`)