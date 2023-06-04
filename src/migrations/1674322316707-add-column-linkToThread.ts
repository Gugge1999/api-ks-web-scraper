import { MigrationInterface, QueryRunner } from "typeorm";

export class addColumnLinkToThread1674322316707 implements MigrationInterface {
  name = "addColumnLinkToThread1674322316707";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "watch" ADD "linkToThread" character varying NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "watch" DROP COLUMN "linkToThread"`);
  }
}
