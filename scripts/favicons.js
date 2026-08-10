#!/usr/bin/env node

// Rasterise the ransom-"w" mark (src/lib/assets/favicon.svg) into the full
// favicon set + web manifest in static/. Run whenever the mark changes.

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src', 'lib', 'assets', 'favicon.svg');
const OUT = path.join(__dirname, '..', 'static');
const BASE = '/web2026/showcase';
const PAPER = '#faf7ef';

const PNGS = [
	{ file: 'favicon-16.png', size: 16 },
	{ file: 'favicon-32.png', size: 32 },
	{ file: 'favicon-48.png', size: 48 },
	{ file: 'apple-touch-icon.png', size: 180, bg: PAPER }, // iOS has no transparency
	{ file: 'icon-192.png', size: 192 },
	{ file: 'icon-512.png', size: 512 }
];

async function render(svg, size, bg) {
	let img = sharp(svg, { density: 384 }).resize(size, size, {
		fit: 'contain',
		background: { r: 0, g: 0, b: 0, alpha: 0 }
	});
	if (bg) img = img.flatten({ background: bg });
	return img.png().toBuffer();
}

async function run() {
	const svg = await fs.readFile(SRC);
	await fs.mkdir(OUT, { recursive: true });

	for (const { file, size, bg } of PNGS) {
		const buf = await render(svg, size, bg);
		await fs.writeFile(path.join(OUT, file), buf);
		console.log(`  ${file} (${size}²)`);
	}

	// maskable: the mark inside the safe area on a paper field (Android masks it)
	const inner = await render(svg, 400);
	const maskable = await sharp({
		create: { width: 512, height: 512, channels: 4, background: PAPER }
	})
		.composite([{ input: inner, gravity: 'center' }])
		.png()
		.toBuffer();
	await fs.writeFile(path.join(OUT, 'maskable-512.png'), maskable);
	console.log('  maskable-512.png');

	// favicon.ico from the small sizes (sharp can't emit ico)
	const ico = await pngToIco([16, 32, 48].map((s) => path.join(OUT, `favicon-${s}.png`)));
	await fs.writeFile(path.join(OUT, 'favicon.ico'), ico);
	console.log('  favicon.ico (16/32/48)');

	// keep the vector master in static/ too — modern browsers prefer it
	await fs.copyFile(SRC, path.join(OUT, 'favicon.svg'));
	console.log('  favicon.svg');

	const manifest = {
		name: 'web2026 showcase',
		short_name: 'web2026',
		description: 'Seven designers learning to build the web end to end. mdes @ daiict.',
		start_url: `${BASE}/`,
		scope: `${BASE}/`,
		display: 'standalone',
		background_color: PAPER,
		theme_color: '#3255a4',
		icons: [
			{ src: `${BASE}/icon-192.png`, sizes: '192x192', type: 'image/png' },
			{ src: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png' },
			{
				src: `${BASE}/maskable-512.png`,
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable'
			}
		]
	};
	await fs.writeFile(path.join(OUT, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
	console.log('  site.webmanifest');

	console.log(`\n🎉 favicon set written to ${OUT}`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
