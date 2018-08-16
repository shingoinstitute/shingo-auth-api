import {MigrationInterface, QueryRunner} from 'typeorm'
// tslint:disable:max-line-length

export class OwnershipMigration1534453153460 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TABLE `user_roles_role` (`userId` int NOT NULL, `roleId` int NOT NULL, PRIMARY KEY (`userId`, `roleId`)) ENGINE=InnoDB')
    await queryRunner.query('CREATE TABLE `user_permissions_permission` (`userId` int NOT NULL, `permissionId` int NOT NULL, PRIMARY KEY (`userId`, `permissionId`)) ENGINE=InnoDB')
    await queryRunner.query('CREATE TABLE `role_permissions_permission` (`roleId` int NOT NULL, `permissionId` int NOT NULL, PRIMARY KEY (`roleId`, `permissionId`)) ENGINE=InnoDB')
    await queryRunner.query('ALTER TABLE `user_roles_role` ADD CONSTRAINT `FK_5f9286e6c25594c6b88c108db77` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `user_roles_role` ADD CONSTRAINT `FK_4be2f7adf862634f5f803d246b8` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `user_permissions_permission` ADD CONSTRAINT `FK_5b72d197d92b8bafbe7906782ec` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `user_permissions_permission` ADD CONSTRAINT `FK_c43a6a56e3ef281cbfba9a77457` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `role_permissions_permission` ADD CONSTRAINT `FK_b36cb2e04bc353ca4ede00d87b9` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `role_permissions_permission` ADD CONSTRAINT `FK_bfbc9e263d4cea6d7a8c9eb3ad2` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE CASCADE')

    const roleUsersUser: Array<{userId: number, roleId: number}> = await queryRunner.query('SELECT * FROM `role_users_user`')
    const permissionUsersUser: Array<{permissionId: number, userId: number}> = await queryRunner.query('SELECT * FROM `permission_users_user`')
    const permissionRolesRole: Array<{permissionId: number, roleId: number}> = await queryRunner.query('SELECT * FROM `permission_roles_role`')

    await queryRunner.query('INSERT INTO `user_roles_role` (`userId`, `roleId`) VALUES ' + roleUsersUser.map(r => `(${r.userId},${r.roleId})`).join())
    await queryRunner.query('INSERT INTO `user_permissions_permission` (`userId`, `permissionId`) VALUES ' + permissionUsersUser.map(r => `(${r.userId},${r.permissionId})`).join())
    await queryRunner.query('INSERT INTO `role_permissions_permission` (`roleId`, `permissionId`) VALUES ' + permissionRolesRole.map(r => `(${r.roleId},${r.permissionId})`).join())

    await queryRunner.query('ALTER TABLE `permission_roles_role` DROP FOREIGN KEY `FK_7ec93d4fbf75b063f3ffd2646a5`')
    await queryRunner.query('ALTER TABLE `permission_roles_role` DROP FOREIGN KEY `FK_9f44b6228b173c7b9dfb8c66003`')
    await queryRunner.query('ALTER TABLE `permission_users_user` DROP FOREIGN KEY `FK_a68535c371c96a600abe56090b7`')
    await queryRunner.query('ALTER TABLE `permission_users_user` DROP FOREIGN KEY `FK_bc69d573e16cfac073d1a1aeedc`')
    await queryRunner.query('ALTER TABLE `role_users_user` DROP FOREIGN KEY `FK_a88fcb405b56bf2e2646e9d4797`')
    await queryRunner.query('ALTER TABLE `role_users_user` DROP FOREIGN KEY `FK_ed6edac7184b013d4bd58d60e54`')
    await queryRunner.query('DROP TABLE `permission_roles_role`')
    await queryRunner.query('DROP TABLE `permission_users_user`')
    await queryRunner.query('DROP TABLE `role_users_user`')
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE TABLE `permission_roles_role` (`permissionId` int NOT NULL, `roleId` int NOT NULL, PRIMARY KEY (`permissionId`, `roleId`)) ENGINE=InnoDB')
    await queryRunner.query('CREATE TABLE `permission_users_user` (`permissionId` int NOT NULL, `userId` int NOT NULL, PRIMARY KEY (`permissionId`, `userId`)) ENGINE=InnoDB')
    await queryRunner.query('CREATE TABLE `role_users_user` (`roleId` int NOT NULL, `userId` int NOT NULL, PRIMARY KEY (`roleId`, `userId`)) ENGINE=InnoDB')
    await queryRunner.query('ALTER TABLE `permission_roles_role` ADD CONSTRAINT `FK_7ec93d4fbf75b063f3ffd2646a5` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `permission_roles_role` ADD CONSTRAINT `FK_9f44b6228b173c7b9dfb8c66003` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `permission_users_user` ADD CONSTRAINT `FK_a68535c371c96a600abe56090b7` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `permission_users_user` ADD CONSTRAINT `FK_bc69d573e16cfac073d1a1aeedc` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `role_users_user` ADD CONSTRAINT `FK_a88fcb405b56bf2e2646e9d4797` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `role_users_user` ADD CONSTRAINT `FK_ed6edac7184b013d4bd58d60e54` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE')

    const rolePermissionsPermission: Array<{permissionId: number, roleId: number}> = await queryRunner.query('SELECT * FROM `role_permissions_permission`')
    const userPermissionsPermission: Array<{permissionId: number, userId: number}> = await queryRunner.query('SELECT * FROM `user_permissions_permission`')
    const userRolesRole: Array<{userId: number, roleId: number}> = await queryRunner.query('SELECT * FROM `user_roles_role`')

    await queryRunner.query('INSERT INTO `permission_roles_role` (`roleId`, `permissionId`) VALUES ' + rolePermissionsPermission.map(r => `(${r.roleId},${r.permissionId})`).join())
    await queryRunner.query('INSERT INTO `permission_users_user` (`userId`, `permissionId`) VALUES ' + userPermissionsPermission.map(r => `(${r.userId},${r.permissionId})`).join())
    await queryRunner.query('INSERT INTO `role_users_user` (`userId`, `roleId`) VALUES ' + userRolesRole.map(r => `(${r.userId},${r.roleId})`).join())

    await queryRunner.query('ALTER TABLE `role_permissions_permission` DROP FOREIGN KEY `FK_bfbc9e263d4cea6d7a8c9eb3ad2`')
    await queryRunner.query('ALTER TABLE `role_permissions_permission` DROP FOREIGN KEY `FK_b36cb2e04bc353ca4ede00d87b9`')
    await queryRunner.query('ALTER TABLE `user_permissions_permission` DROP FOREIGN KEY `FK_c43a6a56e3ef281cbfba9a77457`')
    await queryRunner.query('ALTER TABLE `user_permissions_permission` DROP FOREIGN KEY `FK_5b72d197d92b8bafbe7906782ec`')
    await queryRunner.query('ALTER TABLE `user_roles_role` DROP FOREIGN KEY `FK_4be2f7adf862634f5f803d246b8`')
    await queryRunner.query('ALTER TABLE `user_roles_role` DROP FOREIGN KEY `FK_5f9286e6c25594c6b88c108db77`')
    await queryRunner.query('DROP TABLE `role_permissions_permission`')
    await queryRunner.query('DROP TABLE `user_permissions_permission`')
    await queryRunner.query('DROP TABLE `user_roles_role`')
  }

}
