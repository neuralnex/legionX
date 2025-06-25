import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingProperties1709123456790 implements MigrationInterface {
    name = 'AddMissingProperties1709123456790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add type column to listing table
        await queryRunner.query(`
            ALTER TABLE "listing" 
            ADD COLUMN IF NOT EXISTS "type" character varying
        `);

        // Add currency column to purchase table
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "currency" character varying
        `);

        // Add paymentMethod column to purchase table
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "paymentMethod" character varying
        `);

        // Add transactionId column to purchase table
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "transactionId" character varying
        `);

        // Add purchaseDate column to purchase table
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "purchaseDate" TIMESTAMP
        `);

        // Add price column to purchase table (if it doesn't exist)
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "price" decimal(20,0)
        `);

        // Add subscriptionId column to purchase table (if it doesn't exist)
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "subscriptionId" character varying
        `);

        // Add subscriptionExpiry column to purchase table (if it doesn't exist)
        await queryRunner.query(`
            ALTER TABLE "purchase" 
            ADD COLUMN IF NOT EXISTS "subscriptionExpiry" TIMESTAMP
        `);

        // Add listingFeeTxHash column to listing table (if it doesn't exist)
        await queryRunner.query(`
            ALTER TABLE "listing" 
            ADD COLUMN IF NOT EXISTS "listingFeeTxHash" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from purchase table
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN IF EXISTS "purchaseDate"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN IF EXISTS "transactionId"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN IF EXISTS "paymentMethod"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN IF EXISTS "currency"`);

        // Remove columns from listing table
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN IF EXISTS "type"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN IF EXISTS "listingFeeTxHash"`);
    }
} 