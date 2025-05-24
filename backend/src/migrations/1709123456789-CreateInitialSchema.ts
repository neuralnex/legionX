import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1709123456789 implements MigrationInterface {
    name = 'CreateInitialSchema1709123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if enum types exist before creating them
        const listingStatusExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'listing_status_enum'
            );
        `);

        const purchaseStatusExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'purchase_status_enum'
            );
        `);

        // Create enum types if they don't exist
        if (!listingStatusExists[0].exists) {
            await queryRunner.query(`
                CREATE TYPE "public"."listing_status_enum" AS ENUM('pending', 'active', 'sold', 'cancelled')
            `);
        }

        if (!purchaseStatusExists[0].exists) {
            await queryRunner.query(`
                CREATE TYPE "public"."purchase_status_enum" AS ENUM('pending', 'completed', 'failed')
            `);
        }

        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" SERIAL NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "wallet" character varying,
                "hasAnalyticsAccess" boolean NOT NULL DEFAULT false,
                "analyticsExpiry" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

        // Create agents table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "agent" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "modelVersion" character varying NOT NULL,
                "metadataUri" character varying NOT NULL,
                "creatorId" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_agent" PRIMARY KEY ("id")
            )
        `);

        // Create listings table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "listing" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "price" decimal(20,0) NOT NULL,
                "fullPrice" decimal(20,0),
                "duration" integer NOT NULL,
                "subscriptionId" character varying,
                "modelMetadata" jsonb NOT NULL,
                "txHash" character varying,
                "confirmations" integer,
                "metadataUri" character varying NOT NULL,
                "status" "public"."listing_status_enum" NOT NULL DEFAULT 'pending',
                "title" character varying NOT NULL,
                "description" character varying NOT NULL,
                "assetId" character varying NOT NULL,
                "ownerAddress" character varying NOT NULL,
                "isPremium" boolean NOT NULL DEFAULT false,
                "premiumExpiry" TIMESTAMP,
                "isActive" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "sellerId" integer,
                "agentId" integer,
                CONSTRAINT "PK_listing" PRIMARY KEY ("id")
            )
        `);

        // Create purchases table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "purchase" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" decimal(20,0) NOT NULL,
                "status" "public"."purchase_status_enum" NOT NULL DEFAULT 'pending',
                "txHash" character varying,
                "confirmations" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "buyerId" integer,
                "listingId" uuid,
                CONSTRAINT "PK_purchase" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints if they don't exist
        const constraints = [
            {
                table: "agent",
                name: "FK_agent_creator",
                sql: `ALTER TABLE "agent" 
                    ADD CONSTRAINT "FK_agent_creator" 
                    FOREIGN KEY ("creatorId") 
                    REFERENCES "user"("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION`
            },
            {
                table: "listing",
                name: "FK_listing_seller",
                sql: `ALTER TABLE "listing" 
                    ADD CONSTRAINT "FK_listing_seller" 
                    FOREIGN KEY ("sellerId") 
                    REFERENCES "user"("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION`
            },
            {
                table: "listing",
                name: "FK_listing_agent",
                sql: `ALTER TABLE "listing" 
                    ADD CONSTRAINT "FK_listing_agent" 
                    FOREIGN KEY ("agentId") 
                    REFERENCES "agent"("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION`
            },
            {
                table: "purchase",
                name: "FK_purchase_buyer",
                sql: `ALTER TABLE "purchase" 
                    ADD CONSTRAINT "FK_purchase_buyer" 
                    FOREIGN KEY ("buyerId") 
                    REFERENCES "user"("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION`
            },
            {
                table: "purchase",
                name: "FK_purchase_listing",
                sql: `ALTER TABLE "purchase" 
                    ADD CONSTRAINT "FK_purchase_listing" 
                    FOREIGN KEY ("listingId") 
                    REFERENCES "listing"("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION`
            }
        ];

        for (const constraint of constraints) {
            const exists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = '${constraint.name}'
                );
            `);

            if (!exists[0].exists) {
                await queryRunner.query(constraint.sql);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT IF EXISTS "FK_purchase_listing"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT IF EXISTS "FK_purchase_buyer"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP CONSTRAINT IF EXISTS "FK_listing_agent"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP CONSTRAINT IF EXISTS "FK_listing_seller"`);
        await queryRunner.query(`ALTER TABLE "agent" DROP CONSTRAINT IF EXISTS "FK_agent_creator"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "purchase"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "listing"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "agent"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."purchase_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."listing_status_enum"`);
    }
} 