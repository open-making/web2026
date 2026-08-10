#!/usr/bin/env node

// Render /print/sharecard (a 1200×630 riso card) headless and write it to
// static/sharecard.jpg — the image the root layout's og:image points at.
// Captured at 2× then downscaled to exactly 1200×630 for crisp text.

import { chromium } from 'playwright';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run(baseUrl) {
	const base = `${baseUrl.replace(/\/$/, '')}/web2026/showcase`;
	const outPath = path.join(__dirname, '..', 'static', 'sharecard.jpg');

	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: 1200, height: 630 },
		deviceScaleFactor: 2
	});
	await page.goto(`${base}/print/sharecard`, { waitUntil: 'networkidle', timeout: 45000 });
	await page.evaluate(async () => {
		await document.fonts.ready;
		await Promise.all([
			document.fonts.load('900 48px Cartridge'),
			document.fonts.load('700 24px Scorekard'),
			document.fonts.load('400 24px Spagetty')
		]);
	});
	await page.waitForTimeout(400);

	const card = page.locator('.card').first();
	const png = await card.screenshot({ type: 'png' });
	await browser.close();

	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await sharp(png).resize(1200, 630).jpeg({ quality: 88, mozjpeg: true }).toFile(outPath);
	console.log(`🎉 share card → ${outPath} (1200×630)`);
}

const args = process.argv.slice(2);
let baseUrl = process.env.POSTER_BASE_URL || 'http://localhost:4173';
for (let i = 0; i < args.length; i++) if (args[i] === '--base-url') baseUrl = args[++i];

run(baseUrl).catch((e) => {
	console.error(e);
	process.exit(1);
});
