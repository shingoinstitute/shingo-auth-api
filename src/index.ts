import { AuthMicroservice } from './microservices/auth.microservice';
import * as grpc from 'grpc';

const microservice = new AuthMicroservice();
const port = process.env.PORT || 8888;

let server = new grpc.Server();
server.addService(microservice.authServices.AuthServices.service, {
    createUser: microservice.createUser,
    readUser: microservice.readUser,
    updateUser: microservice.updateUser,
    deleteUser: microservice.deleteUser,
    addRoleToUser: microservice.addRoleToUser,
    removeRoleFromUser: microservice.removeRoleFromUser,
    createPermission: microservice.createPermission,
    readPermission: microservice.readPermission,
    updatePermission: microservice.updatePermission,
    deletePermission: microservice.deletePermission,
    createRole: microservice.createRole,
    readRole: microservice.readRole,
    updateRole: microservice.updateRole,
    deleteRole: microservice.deleteRole,
    login: microservice.login,
    isValid: microservice.isValid,
    canAccess: microservice.canAccess,
    grantPermissionToUser: microservice.grantPermissionToUser,
    grantPermissionToRole: microservice.grantPermissionToRole,
    revokePermissionFromUser: microservice.revokePermissionFromUser,
    revokePermissionFromRole: microservice.revokePermissionFromRole
});

server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
server.start();
console.log(`AuthMicroservice is listening on port ${port}.`)