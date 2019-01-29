import {MigrationInterface, QueryRunner} from 'typeorm';

export class ServicesToSimpleArray1548722940128 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<any> {
    const prevServices: Array<{id: number; services: string}> = await queryRunner.query('SELECT id, services FROM `user`')
    const convertedServices = prevServices.map(v => ({
      ...v,
      services: [...new Set(v.services.split(',').map(s => s.trim()))]
    }))

    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `services`')
    await queryRunner.query("ALTER TABLE `user` ADD `services` text NOT NULL")

    // probably not the best way to do a conditional batch insert
    const actions = convertedServices.map(({ id, services }) =>
      () => queryRunner.query("UPDATE `user` SET `services` = ? WHERE id = ?", [services.join(','), id])
    )
    // runs the promises in sequence so that we don't accidently overwrite
    await actions.reduceRight((ps, action) => ps.then(action), Promise.resolve() as Promise<any>)
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    // these services should already be in a format that works
    const prevServices: Array<{id: number; services: string}> = await queryRunner.query('SELECT id, services FROM `user`')

    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `services`')
    await queryRunner.query("ALTER TABLE `user` ADD `services` varchar(255) NOT NULL DEFAULT ''")

    // probably not the best way to do a conditional batch insert
    const actions = prevServices.map(({ id, services }) =>
      () => queryRunner.query("UPDATE `user` SET `services` = ? WHERE id = ?", [services, id])
    )
    // runs the promises in sequence so that we don't accidently overwrite
    await actions.reduceRight((ps, action) => ps.then(action), Promise.resolve() as Promise<any>)
  }

}
