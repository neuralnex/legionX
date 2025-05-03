
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema implements MigrationInterface {
  name = "InitSchema"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user" (
      "id" SERIAL NOT NULL,
      "walletAddress" character varying NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_wallet_address" UNIQUE ("walletAddress"),
      CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "agent" (
      "id" SERIAL NOT NULL,
      "name" character varying NOT NULL,
      "description" text NOT NULL,
      "modelUri" character varying,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_agent_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "listing" (
      "id" SERIAL NOT NULL,
      "txHash" character varying NOT NULL,
      "price" numeric NOT NULL,
      "fullPrice" numeric NOT NULL,
      "duration" integer NOT NULL,
      "subscriptionId" character varying,
      "metadataUri" character varying NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "sellerId" integer,
      "agentId" integer,
      CONSTRAINT "PK_listing_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "purchase" (
      "id" SERIAL NOT NULL,
      "txHash" character varying NOT NULL,
      "accessType" character varying NOT NULL,
      "expiry" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "listingId" integer,
      "buyerId" integer,
      CONSTRAINT "PK_purchase_id" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "fee" (
      "id" SERIAL NOT NULL,
      "listingFee" numeric NOT NULL,
      "marketplaceCut" numeric NOT NULL,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_fee_id" PRIMARY KEY ("id")
    )`);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE "listing"
      ADD CONSTRAINT "FK_listing_seller" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "listing"
      ADD CONSTRAINT "FK_listing_agent" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "purchase"
      ADD CONSTRAINT "FK_purchase_listing" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "purchase"
      ADD CONSTRAINT "FK_purchase_buyer" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "purchase"`);
    await queryRunner.query(`DROP TABLE "listing"`);
    await queryRunner.query(`DROP TABLE "fee"`);
    await queryRunner.query(`DROP TABLE "agent"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
