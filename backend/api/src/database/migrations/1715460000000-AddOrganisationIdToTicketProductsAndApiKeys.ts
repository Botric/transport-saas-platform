import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganisationIdToTicketProductsAndApiKeys1715460000000 implements MigrationInterface {
  name = 'AddOrganisationIdToTicketProductsAndApiKeys1715460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ticket_products: add organisation_id
    await queryRunner.query(`
      ALTER TABLE "ticket_products"
      ADD COLUMN IF NOT EXISTS "organisation_id" uuid REFERENCES "organisations"("id") ON DELETE SET NULL
    `);

    // api_keys: add organisation_id
    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD COLUMN IF NOT EXISTS "organisation_id" uuid REFERENCES "organisations"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN IF EXISTS "organisation_id"`);
    await queryRunner.query(`ALTER TABLE "ticket_products" DROP COLUMN IF EXISTS "organisation_id"`);
  }
}
