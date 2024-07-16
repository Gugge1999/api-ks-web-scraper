import type { MigrationInterface, QueryRunner } from "typeorm";

export class renameColumnLinkToThreadToWatchToScrape1676220490329 implements MigrationInterface {
  name = "renameColumnLinkToThreadToWatchToScrape1676220490329";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "watch" DROP COLUMN "linkToThread"`);
    await queryRunner.query(`ALTER TABLE "watch" ADD "watchToScrape" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "watch" DROP COLUMN "watchToScrape"`);
    await queryRunner.query(`ALTER TABLE "watch" ADD "linkToThread" character varying NOT NULL`);
  }
}
