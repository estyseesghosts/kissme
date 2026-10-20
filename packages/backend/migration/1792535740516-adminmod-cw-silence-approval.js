/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AdminmodCwSilenceApproval1792535740516 {
    name = 'AdminmodCwSilenceApproval1792535740516';

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE "user" ADD "isSilenced" boolean NOT NULL DEFAULT false');
        await queryRunner.query(`COMMENT ON COLUMN "user"."isSilenced" IS 'Whether the User is silenced.'`);
        await queryRunner.query('ALTER TABLE "user" ADD "approved" boolean NOT NULL DEFAULT true');
        await queryRunner.query(`COMMENT ON COLUMN "user"."approved" IS 'Whether the User is approved.'`);
        await queryRunner.query('ALTER TABLE "user" ADD "mandatoryCW" text');
        await queryRunner.query(`COMMENT ON COLUMN "user"."mandatoryCW" IS 'Content Warning forcibly applied to all notes by the User.'`);
        await queryRunner.query('ALTER TABLE "user" ADD "rejectQuotes" boolean NOT NULL DEFAULT false');
        await queryRunner.query(`COMMENT ON COLUMN "user"."rejectQuotes" IS 'Whether quote posts from the User are rejected.'`);
        await queryRunner.query('ALTER TABLE "note" ADD "mandatoryCW" text');
        await queryRunner.query(`COMMENT ON COLUMN "note"."mandatoryCW" IS 'Content Warning forcibly attached to the note by moderators.'`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "note"."mandatoryCW" IS 'Content Warning forcibly attached to the note by moderators.'`);
        await queryRunner.query('ALTER TABLE "note" DROP COLUMN "mandatoryCW"');
        await queryRunner.query(`COMMENT ON COLUMN "user"."rejectQuotes" IS 'Whether quote posts from the User are rejected.'`);
        await queryRunner.query('ALTER TABLE "user" DROP COLUMN "rejectQuotes"');
        await queryRunner.query(`COMMENT ON COLUMN "user"."mandatoryCW" IS 'Content Warning forcibly applied to all notes by the User.'`);
        await queryRunner.query('ALTER TABLE "user" DROP COLUMN "mandatoryCW"');
        await queryRunner.query(`COMMENT ON COLUMN "user"."approved" IS 'Whether the User is approved.'`);
        await queryRunner.query('ALTER TABLE "user" DROP COLUMN "approved"');
        await queryRunner.query(`COMMENT ON COLUMN "user"."isSilenced" IS 'Whether the User is silenced.'`);
        await queryRunner.query('ALTER TABLE "user" DROP COLUMN "isSilenced"');
    }
};
