#!/usr/bin/env node

// Export the wordmark, the per-student business cards, and the full-page
// collages from their /print routes. Same headless-Chromium approach as
// posters.js (the riso look is SVG filters + blends, so we render the real
// Svelte routes rather than reconstruct them), but each family here has its own
// paper size and capture rules:
//
//   wordmark  → transparent PNG (omitBackground), no PDF — it's a logo to drop
//   cards     → 3.5×2in PNG (300 DPI) + PDF, one per contributor
//   collages  → A4 PNG (300 DPI) + PDF, full-bleed, portrait & landscape
//
// Assumes `vite build` has run and a `vite preview` is up (scripts/collateral.js
// chains all of that; or pass --base-url to point at any running preview).

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import studentDatabase from '../src/lib/data/student-database.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// keep in sync with collage/[key] KEYS and screenshots.json groups
const COLLAGE_KEYS = ['cover', 'bohemian', 'print', 'clocks', 'final'];
const SLUGS = Object.values(studentDatabase.students).map((s) => s.slug);
const ORIENTATIONS = ['portrait', 'landscape'];

const DSF = 300 / 96; // 3.125 → 300 DPI raster
// A4 at 96 CSS-dpi; viewport padded past the sheet so centering never clips it
const A4 = {
	portrait: { w: '210mm', h: '297mm', vw: 960, vh: 1260 },
	landscape: { w: '297mm', h: '210mm', vw: 1280, vh: 940 }
};

// each target: where it lives, what element to shoot, and how to size it
function buildTargets() {
	const t = [];

	// 1. the wordmark — transparent, its own tight crop, no PDF
	t.push({
		dir: 'wordmark',
		name: 'wordmark',
		route: 'print/wordmark',
		selector: '.wordmark',
		viewport: { width: 1600, height: 800 },
		dsf: 4,
		omitBackground: true,
		pdf: null
	});

	// 2. business cards — 3.5×2in, one per student
	for (const slug of SLUGS)
		t.push({
			dir: 'cards',
			name: `card-${slug}`,
			route: `print/card/${slug}`,
			selector: '.card',
			viewport: { width: 900, height: 560 },
			dsf: DSF,
			omitBackground: false,
			pdf: { width: '88.9mm', height: '50.8mm' }
		});

	// 3. collages — full-bleed A4, cover + each exercise, both orientations
	for (const key of COLLAGE_KEYS)
		for (const o of ORIENTATIONS) {
			const a4 = A4[o];
			t.push({
				dir: 'collages',
				name: `collage-${key}-${o}`,
				route: `print/collage/${key}/${o}`,
				selector: '.sheet',
				viewport: { width: a4.vw, height: a4.vh },
				dsf: DSF,
				omitBackground: false,
				pdf: { width: a4.w, height: a4.h }
			});
		}

	return t;
}

// fonts are @font-face display:swap — capture too early and a poster bakes in a
// fallback face. Wait until the three families are actually loaded.
async function waitForFonts(page) {
	await page.evaluate(async () => {
		await document.fonts.ready;
		await Promise.all([
			document.fonts.load('900 48px Cartridge'),
			document.fonts.load('700 24px Scorekard'),
			document.fonts.load('400 24px Spagetty')
		]);
	});
	await page.waitForTimeout(400);
}

async function run(options) {
	const { baseUrl, outputRoot } = options;
	const base = `${baseUrl.replace(/\/$/, '')}/web2026/showcase`;
	const targets = buildTargets();

	const browser = await chromium.launch();
	console.log(`🎨 ${targets.length} extra collateral pieces → ${outputRoot}`);
	const results = [];

	for (let i = 0; i < targets.length; i++) {
		const target = targets[i];
		const outDir = path.join(outputRoot, target.dir);
		await fs.mkdir(outDir, { recursive: true });

		const page = await browser.newPage({
			viewport: target.viewport,
			deviceScaleFactor: target.dsf
		});
		try {
			await page.goto(`${base}/${target.route}`, { waitUntil: 'networkidle', timeout: 45000 });
			await waitForFonts(page);
			console.log(`🖼️  ${i + 1}/${targets.length}: ${target.name}`);

			// omitBackground only drops the browser's default paint — the /print
			// layout still paints the stage grey. Clear it so the PNG is truly clear.
			if (target.omitBackground)
				await page.addStyleTag({
					content: 'html,body{background:transparent !important}.stage{background:transparent !important}'
				});

			const el = page.locator(target.selector).first();
			await el.screenshot({
				path: path.join(outDir, `${target.name}.png`),
				type: 'png',
				omitBackground: target.omitBackground
			});

			if (target.pdf) {
				await page.pdf({
					path: path.join(outDir, `${target.name}.pdf`),
					width: target.pdf.width,
					height: target.pdf.height,
					printBackground: true,
					pageRanges: '1',
					margin: { top: 0, right: 0, bottom: 0, left: 0 }
				});
			}
			results.push({ name: target.name, route: target.route, dir: target.dir });
		} catch (err) {
			console.error(`   ❌ ${target.name}: ${err.message}`);
			results.push({ name: target.name, route: target.route, error: err.message });
		} finally {
			await page.close();
		}
	}

	await browser.close();
	await fs.writeFile(path.join(outputRoot, 'extra-metadata.json'), JSON.stringify(results, null, 2));
	const ok = results.filter((r) => !r.error).length;
	console.log(`\n🎉 ${ok}/${results.length} extra collateral pieces written to ${outputRoot}`);
}

// CLI
const args = process.argv.slice(2);
const opts = {
	baseUrl: process.env.POSTER_BASE_URL || 'http://localhost:4173',
	outputRoot: path.join(__dirname, '..', 'collateral')
};
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--base-url') opts.baseUrl = args[++i];
	else if (args[i] === '--output-dir') opts.outputRoot = path.resolve(args[++i]);
}

run(opts).catch((e) => {
	console.error(e);
	process.exit(1);
});
