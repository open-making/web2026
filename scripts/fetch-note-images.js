#!/usr/bin/env node

// Pull every image the students attached to their dev notes, optimize to webp
// (max 900px wide), and index them with author/day so the collage can credit
// and link each one. Videos and dead links are skipped.

import { promises as fs } from 'fs';
import sharp from 'sharp';

const db = JSON.parse(await fs.readFile('src/lib/data/student-database.json', 'utf8'));
const outDir = 'src/lib/assets/images/notes';
await fs.mkdir(outDir, { recursive: true });

let existing = {};
try {
	existing = JSON.parse(await fs.readFile(`${outDir}/index.json`, 'utf8'));
} catch {
	/* first run */
}

const found = [];
for (const s of Object.values(db.students)) {
	for (const n of s.devNotes) {
		const md = [...n.content.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g)].map((m) => m[1]);
		const html = [...n.content.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
		const bare = [
			...n.content.matchAll(
				/https?:\/\/(?:user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\/[^\s)">]+/g
			)
		].map((m) => m[0]);
		for (const url of new Set([...md, ...html, ...bare])) {
			found.push({ url, author: s.name, slug: s.slug, day: n.day, commentUrl: n.commentUrl });
		}
	}
}

// dedupe by url, keep first attribution
const byUrl = new Map();
for (const f of found) if (!byUrl.has(f.url)) byUrl.set(f.url, f);

const index = {};
let ok = 0;
let skipped = 0;
for (const [url, meta] of byUrl) {
	const id = url.split('/').pop().split('?')[0].replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40);
	const file = `${meta.slug}-${id}.webp`;
	if (existing[url]) {
		index[url] = existing[url];
		ok++;
		continue;
	}
	try {
		const res = await fetch(url, { redirect: 'follow' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const type = res.headers.get('content-type') ?? '';
		if (type.startsWith('video/')) {
			skipped++;
			continue;
		}
		const buf = Buffer.from(await res.arrayBuffer());
		await sharp(buf, { animated: false })
			.resize({ width: 900, withoutEnlargement: true })
			.webp({ quality: 76 })
			.toFile(`${outDir}/${file}`);
		index[url] = { file, author: meta.author, slug: meta.slug, day: meta.day, commentUrl: meta.commentUrl };
		ok++;
	} catch (e) {
		skipped++;
		console.log(`  skip (${e.message.slice(0, 40)}): ${url.slice(0, 70)}`);
	}
}

await fs.writeFile(`${outDir}/index.json`, JSON.stringify(index, null, 2));
console.log(`✅ ${ok} note images saved, ${skipped} skipped`);
