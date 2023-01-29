import { MigrationInterface, QueryRunner } from "typeorm";

export class lastEmailSentIsNullable1675003489684 implements MigrationInterface {
    name = 'lastEmailSentIsNullable1675003489684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch" ALTER COLUMN "lastEmailSent" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch" ALTER COLUMN "lastEmailSent" SET NOT NULL`);
    }

}
