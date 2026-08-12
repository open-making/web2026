#!/usr/bin/env node

// Re-shoot the screenshots for specific students (or a whole group) without the
// footgun in screenshot-manifest.js, which rebuilds each group's index.json from
// only the successful shots and so DROPS any site that happens to be down.
//
// This one shoots just the URLs you ask for, using the same settings as the
// manifest (viewport-only 1200x900 webp q82), overwrites the matching .webp in
// place, and merges (never truncates) the url->file entry back into index.json.
//
// Usage:
//   pnpm shoot aditi                     # one student in the final group
//   pnpm shoot aditi anchita             # several students
//   pnpm shoot --group print aditi       # a different group
//   pnpm shoot --group clocks --all      # every site in a group
//   pnpm shoot --load aditi              # use waitUntil:'load' for sites that
//                                        # hang on networkidle (e.g. netlify)
//
// Groups: final (default), bohemian, print, clocks.

import { promises as fs } from 'fs';
import { takeScreenshots } from './screenshot.js';

const MANIFEST = 'src/content/screenshots.json';

const args = process.argv.slice(2);
let group = 'final';
let all = false;
let waitUntil = 'networkidle';
const slugs = [];

for (let i = 0; i < args.length; i++) {
	const a = args[i];
	if (a === '--group' && i + 1 < args.length) group = args[++i];
	else if (a === '--all') all = true;
	else if (a === '--load') waitUntil = 'load';
	else if (a.startsWith('-')) {
		console.error(`unknown flag: ${a}`);
		process.exit(1);
	} else slugs.push(a.toLowerCase());
}

const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
const entries = manifest[group];
if (!entries) {
	console.error(`unknown group "${group}". choose one of: ${Object.keys(manifest).join(', ')}`);
	process.exit(1);
}

if (!all && slugs.length === 0) {
	console.error(
		'name at least one student slug, or pass --all.\n' +
			`  pnpm shoot aditi\n  pnpm shoot --group ${group} --all`
	);
	process.exit(1);
}

// pick the entries to shoot; report any slug that isn't in this group
const picked = all
	? entries
	: slugs.map((slug) => {
			const e = entries.find((x) => x.slug.toLowerCase() === slug);
			if (!e) {
				const known = entries.map((x) => x.slug).join(', ');
				console.error(`no "${slug}" in the ${group} group. known slugs: ${known}`);
				process.exit(1);
			}
			return e;
		});

const outputDir = `src/lib/assets/images/${group}`;
console.log(
	`📸 ${group}: shooting ${picked.length} site(s) — ${picked.map((e) => e.slug).join(', ')}` +
		(waitUntil === 'load' ? ' (waitUntil:load)' : '')
);

const results = await takeScreenshots(
	picked.map((e) => e.url),
	{
		outputDir,
		fullPage: false,
		width: 1200,
		height: 900,
		format: 'webp',
		quality: 82,
		waitUntil,
		writeMetadata: false
	}
);

// merge produced filenames into the existing index.json; leave everyone else's
// entries alone, and keep a down site's old screenshot rather than dropping it
const indexPath = `${outputDir}/index.json`;
const index = JSON.parse(await fs.readFile(indexPath, 'utf8'));
const failed = [];
for (const r of results) {
	if (r.filename && !r.error) index[r.url] = r.filename;
	else if (r.error) failed.push(r);
}
await fs.writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');

if (failed.length) {
	console.error(`\n❌ ${failed.length} failed (kept their old screenshot):`);
	for (const f of failed) console.error(`   ${f.url}: ${f.error}`);
	if (waitUntil !== 'load') console.error('   → retry these with --load');
	process.exit(1);
}
console.log(`\n✅ updated ${indexPath}`);
