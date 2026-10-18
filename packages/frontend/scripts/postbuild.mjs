#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../../built/_frontend_vite_');

const manifestPath = resolve(outputDir, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

// Collect vite asset files (mirrors HtmlTemplateService.collectViteAssetFiles)
const entryChunk = Object.values(manifest).find((c) => c.isEntry);
const cssFiles = new Set();
const modulePreloads = new Set();
if (entryChunk) {
	if (entryChunk.css) entryChunk.css.forEach((c) => cssFiles.add(c));
	if (entryChunk.imports) {
		const seen = new Set();
		function collect(imports, recursive = false) {
			for (const id of imports) {
				if (seen.has(id)) continue;
				seen.add(id);
				const chunk = manifest[id];
				if (!chunk) continue;
				if (chunk.css) chunk.css.forEach((c) => cssFiles.add(c));
				if (chunk.imports) collect(chunk.imports, true);
				if (!recursive) modulePreloads.add(chunk.file);
			}
		}
		collect(entryChunk.imports);
	}
}

const entryJs = entryChunk ? entryChunk.file : null;

// Bootloader files
const bootloaderJsPath = resolve(outputDir, 'loader/boot.js');
const bootloaderCssPath = resolve(outputDir, 'loader/style.css');
const bootloaderJs = existsSync(bootloaderJsPath) ? readFileSync(bootloaderJsPath, 'utf-8') : null;
const bootloaderCss = existsSync(bootloaderCssPath) ? readFileSync(bootloaderCssPath, 'utf-8') : null;

const backendUrl = process.env.VITE_BACKEND_URL || '';

// Build HTML
const cssLinks = [...cssFiles].map((f) => `<link rel="stylesheet" href="/vite/${f}" />`).join('\n\t');
const preloadLinks = [...modulePreloads].map((f) => `<link rel="modulepreload" href="/vite/${f}" />`).join('\n\t');

let html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta property="instance_url" content="${backendUrl}" />
	<meta property="og:site_name" content="Misskey" />
	<title>Misskey</title>
${bootloaderCss ? `\t<style>\n${bootloaderCss}\n\t</style>` : ''}
${cssLinks}
${preloadLinks}
</head>
<body>
${bootloaderJs ? `\t<script>\n${bootloaderJs}\n\t</script>` : ''}
${entryJs ? `\t<script>window.__CLIENT_ENTRY__ = "/vite/${entryJs}";</script>\n\t<script type="module" src="/vite/${entryJs}"></script>` : ''}
</body>
</html>
`;

// Adjust base path if VITE_BASE set
const base = process.env.VITE_BASE || '/vite/';
if (base !== '/vite/') {
	// Replace /vite/ prefix with base for asset paths
	html = html.replace(/\/vite\//g, base.endsWith('/') ? base : base + '/');
}

writeFileSync(resolve(outputDir, 'index.html'), html, 'utf-8');
console.log('[postbuild] index.html generated.');
