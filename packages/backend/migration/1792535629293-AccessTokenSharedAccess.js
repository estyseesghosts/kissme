/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AccessTokenSharedAccess1792535629293 {
    name = 'AccessTokenSharedAccess1792535629293'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."access_token_rank_enum" AS ENUM('user', 'mod', 'admin')`);
        await queryRunner.query(`ALTER TABLE "access_token" ADD "rank" "public"."access_token_rank_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "access_token"."rank" IS 'Limits the user'' rank (user, moderator, or admin) when using this token. If null (default), then uses the user''s actual rank.'`);
        await queryRunner.query(`ALTER TABLE "access_token" ADD "granteeIds" character varying(32) array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`COMMENT ON COLUMN "access_token"."granteeIds" IS 'IDs of other users who are permitted to access and use this token.'`);
        await queryRunner.query(`CREATE INDEX "IDX_access_token_granteeIds" ON "access_token" USING GIN ("granteeIds" array_ops)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_access_token_granteeIds"`);
        await queryRunner.query(`ALTER TABLE "access_token" DROP COLUMN "granteeIds"`);
        await queryRunner.query(`ALTER TABLE "access_token" DROP COLUMN "rank"`);
        await queryRunner.query(`DROP TYPE "public"."access_token_rank_enum"`);
    }
}
