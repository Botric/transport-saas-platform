import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleAndFcmToken1715450000000 implements MigrationInterface {
  name = 'AddUserRoleAndFcmToken1715450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" character varying(30) NOT NULL DEFAULT 'read_only'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fcm_token" character varying(500)`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'read_only' WHERE "role" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "fcm_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`,
    );
  }
}