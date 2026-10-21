/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoteEdit1792536268811 {
    name = 'NoteEdit1792536268811'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."note_edit_visibility_enum" AS ENUM('public', 'home', 'followers', 'specified')`);
        await queryRunner.query(`CREATE TABLE "note_edit" ("id" character varying(32) NOT NULL, "noteId" character varying(32) NOT NULL, "userId" character varying(32) NOT NULL, "renoteId" character varying(32), "replyId" character varying(32), "visibility" "public"."note_edit_visibility_enum" NOT NULL, "newText" text, "cw" text, "newCw" text, "fileIds" character varying(32) array NOT NULL DEFAULT '{}', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "text" text, "oldDate" TIMESTAMP WITH TIME ZONE, "hasPoll" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_736fc6e0d4e222ecc6f82058e08" PRIMARY KEY ("id")); COMMENT ON COLUMN "note_edit"."noteId" IS 'The ID of note.'; COMMENT ON COLUMN "note_edit"."userId" IS 'The ID of author.'; COMMENT ON COLUMN "note_edit"."renoteId" IS 'The ID of renote target. Will always be null for older edits'; COMMENT ON COLUMN "note_edit"."replyId" IS 'The ID of reply target. Will always be null for older edits'; COMMENT ON COLUMN "note_edit"."cw" IS 'Will always be null for older edits'; COMMENT ON COLUMN "note_edit"."updatedAt" IS 'The updated date of the Note.'; COMMENT ON COLUMN "note_edit"."oldDate" IS 'The old date from before the edit'; COMMENT ON COLUMN "note_edit"."hasPoll" IS 'Whether this revision had a poll. Will always be false for older edits'`);
        await queryRunner.query(`CREATE INDEX "IDX_702ad5ae993a672e4fbffbcd38" ON "note_edit"  ("noteId") `);
        await queryRunner.query(`ALTER TABLE "note_edit" ADD CONSTRAINT "FK_702ad5ae993a672e4fbffbcd38c" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note_edit" ADD CONSTRAINT "FK_7f1ded0f6e8a5bef701b7e698ab" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note_edit" ADD CONSTRAINT "FK_d3003e5256bcbfad6c3588835c0" FOREIGN KEY ("renoteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note_edit" ADD CONSTRAINT "FK_f34b53ab9b39774ca014972ad84" FOREIGN KEY ("replyId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "note_edit" DROP CONSTRAINT "FK_f34b53ab9b39774ca014972ad84"`);
        await queryRunner.query(`ALTER TABLE "note_edit" DROP CONSTRAINT "FK_d3003e5256bcbfad6c3588835c0"`);
        await queryRunner.query(`ALTER TABLE "note_edit" DROP CONSTRAINT "FK_7f1ded0f6e8a5bef701b7e698ab"`);
        await queryRunner.query(`ALTER TABLE "note_edit" DROP CONSTRAINT "FK_702ad5ae993a672e4fbffbcd38c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_702ad5ae993a672e4fbffbcd38"`);
        await queryRunner.query(`DROP TABLE "note_edit"`);
        await queryRunner.query(`DROP TYPE "public"."note_edit_visibility_enum"`);
    }
}
