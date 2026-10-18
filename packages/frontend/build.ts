import * as fs from 'fs/promises';
import url from 'node:url';
import path from 'node:path';
import { execa } from 'execa';
import locales from 'i18n';
import { LocaleInliner } from '../frontend-builder/locale-inliner.js'
import { createLogger } from '../frontend-builder/logger';

// requires node 21 or later
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const outputDir = __dirname + '/../../built/_frontend_vite_';

/**
 * @return {Promise<void>}
 */
async function viteBuild() {
	await execa('vite', ['build'], {
		cwd: __dirname,
		stdout: process.stdout,
		stderr: process.stderr,
	});
}


async function buildAllLocale() {
	const logger = createLogger()
	const inliner = await LocaleInliner.create({
		outputDir,
		logger,
		scriptsDir: 'scripts',
		i18nFile: 'src/i18n.ts',
	})

	await inliner.loadFiles();

	inliner.collectsModifications();

	await inliner.saveAllLocales(locales);

	if (logger.errorCount > 0) {
		throw new Error(`Build failed with ${logger.errorCount} errors and ${logger.warningCount} warnings.`);
	}
}

async function copyServiceWorker() {
	const swSrc = __dirname + '/../../built/_sw_dist_/sw.js';
	const swDest = outputDir + '/sw.js';
	try {
		await fs.copyFile(swSrc, swDest);
	} catch {
		// Service worker not built yet; skip (monolithic backend still serves /sw.js).
	}
}

async function build() {
	await fs.rm(outputDir, { recursive: true, force: true });
	await viteBuild();
	await buildAllLocale();
	await copyServiceWorker();
	await runPostbuild();
}

async function runPostbuild() {
	const { execa } = await import('execa');
	await execa('node', [__dirname + '/scripts/postbuild.mjs'], {
		cwd: __dirname,
		stdout: process.stdout,
		stderr: process.stderr,
	});
}

await build();
