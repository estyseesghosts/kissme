/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class BubbleTimelineMeta1792535789001 {
    name = 'BubbleTimelineMeta1792535789001'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "bubbleInstances" character varying(256) array NOT NULL DEFAULT '{}'::varchar[]`);
        await queryRunner.query(`ALTER TABLE "instance" ADD "isBubbled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`COMMENT ON COLUMN "instance"."isBubbled" IS 'True if this instance is part of the local bubble.'`);
        await queryRunner.query(`ALTER TABLE "instance" ADD "rejectQuotes" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "instance" ADD "mandatoryCW" text`);

        const metas = await queryRunner.query(`SELECT "bubbleInstances" FROM "meta"`);
        if (metas.length > 0 && metas[0].bubbleInstances.length > 0) {
            const patterns = metas[0].bubbleInstances.map(i => i.toLowerCase().split('').reverse().join('') + '.%');
            await queryRunner.query(`UPDATE "instance" SET "isBubbled" = true WHERE ((lower(reverse("host")) || '.')::text) LIKE ANY ($1)`, [patterns]);
        }
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "mandatoryCW"`);
        await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "rejectQuotes"`);
        await queryRunner.query(`ALTER TABLE "instance" DROP COLUMN "isBubbled"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "bubbleInstances"`);
    }
}
