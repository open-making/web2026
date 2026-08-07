#!/usr/bin/env node

// Fetch poster art for the film column from Wikipedia page images
// (pilicense=any includes the fair-use film posters). Saves webp posters to
// src/lib/assets/images/films/ and an index.json mapping film → filename.

import { promises as fs } from 'fs';
import sharp from 'sharp';

const curated = JSON.parse(await fs.readFile('src/content/quotes.json', 'utf8'));
const outDir = 'src/lib/assets/images/films';
await fs.mkdir(outDir, { recursive: true });

const UA = { 'User-Agent': 'web2026-zine/1.0 (course showcase; amanbhargava2001@gmail.com)' };

// film title as written in the notes → wikipedia page title
const WIKI_TITLES = {
	"Kiki's Delivery Service": "Kiki's Delivery Service",
	'Knives Out': 'Knives Out',
	"Singin' in the Rain (1952)": "Singin' in the Rain",
	'The Red Shoes (1948)': 'The Red Shoes (1948 film)',
	'The Social Network (2010)': 'The Social Network',
	'Jaane Bhi Do Yaaro (1983)': 'Jaane Bhi Do Yaaro',
	'Project Hail Mary': 'Project Hail Mary',
	'Tamas (1987)': 'Tamas (film)',
	'Run Lola Run (1998)': 'Run Lola Run',
	'The Wind Will Carry Us (1999)': 'The Wind Will Carry Us'
};

const slugify = (t) =>
	t
		.toLowerCase()
		.replace(/\(.*?\)/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

async function posterUrl(wikiTitle) {
	const res = await fetch(
		`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=600&pilicense=any&redirects=1&titles=${encodeURIComponent(wikiTitle)}`,
		{ headers: UA }
	);
	const data = await res.json();
	const pages = Object.values(data.query?.pages ?? {});
	return pages[0]?.thumbnail?.source ?? null;
}

const index = {};
for (const f of curated.films) {
	const wikiTitle = WIKI_TITLES[f.film] ?? f.film;
	let src = null;
	try {
		src = await posterUrl(wikiTitle);
	} catch (e) {
		console.error(`  fetch failed for ${f.film}: ${e.message}`);
	}
	if (!src) {
		console.log(`❌ no poster: ${f.film} (tried "${wikiTitle}")`);
		continue;
	}
	const img = await (await fetch(src, { headers: UA })).arrayBuffer();
	const file = `${slugify(f.film)}.webp`;
	await sharp(Buffer.from(img))
		.resize(360, 520, { fit: 'cover' })
		.webp({ quality: 80 })
		.toFile(`${outDir}/${file}`);
	index[f.film] = file;
	console.log(`✅ ${f.film}`);
	await new Promise((r) => setTimeout(r, 400));
}
await fs.writeFile(`${outDir}/index.json`, JSON.stringify(index, null, 2));
console.log(`\n${Object.keys(index).length}/${curated.films.length} posters saved`);
