import { MigrationInterface, QueryRunner } from "typeorm";

export class renameLastEmailSent1674387137492 implements MigrationInterface {
  name = "renameLastEmailSent1674387137492";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "watch" RENAME COLUMN "last_email_sent" TO "lastEmailSent"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "watch" RENAME COLUMN "lastEmailSent" TO "last_email_sent"`);
  }
}
