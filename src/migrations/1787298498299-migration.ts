import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787298498299 implements MigrationInterface {
    name = 'Migration1787298498299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tokens_type_enum" AS ENUM('refresh', 'blacklist')`);
        await queryRunner.query(`CREATE TABLE "tokens" ("jti" character varying(64) NOT NULL, "type" "public"."tokens_type_enum" NOT NULL, "user_id" character varying(64), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d4251c84698d0633156759f5ee" PRIMARY KEY ("jti"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cb77507dfa03f680d8496d5a79" ON "tokens"  ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_8769073e38c365f315426554ca" ON "tokens"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2703ec1fbf4d8eecbef80cf6c3" ON "tokens"  ("expires_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2703ec1fbf4d8eecbef80cf6c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8769073e38c365f315426554ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb77507dfa03f680d8496d5a79"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
        await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
    }

}
