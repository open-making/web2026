#!/usr/bin/env node

// Screenshot every URL in the curated manifest (src/content/screenshots.json)
// into per-group folders under src/lib/assets/images/. Viewport-only shots at
// 1200x900 so every tile has the same aspect.

import { promises as fs } from 'fs';
import { takeScreenshots } from './screenshot.js';

const manifest = JSON.parse(await fs.readFile('src/content/screenshots.json', 'utf8'));

for (const [group, entries] of Object.entries(manifest)) {
	if (!entries.length) continue;
	console.log(`\n📸 ${group}: ${entries.length} sites`);
	const results = await takeScreenshots(
		entries.map((e) => e.url),
		{
			outputDir: `src/lib/assets/images/${group}`,
			fullPage: false,
			width: 1200,
			height: 900,
			format: 'webp',
			quality: 82
		}
	);
	const failed = results.filter((r) => r.error);
	if (failed.length) {
		console.error(`❌ ${group}: ${failed.length} failed:`);
		for (const f of failed) console.error(`   ${f.url}: ${f.error}`);
	}
	// map url → produced filename for the components
	const index = {};
	for (const r of results) {
		if (r.filename && !r.error) index[r.url] = r.filename;
	}
	await fs.writeFile(
		`src/lib/assets/images/${group}/index.json`,
		JSON.stringify(index, null, 2)
	);
}
console.log('\n✅ screenshots done');
