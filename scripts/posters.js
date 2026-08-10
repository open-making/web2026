#!/usr/bin/env node

// Export every exhibition poster from the /print routes to A4 PDF + 300-DPI PNG.
//
// The riso look is SVG filters + multiply blends, so we render the real Svelte
// routes in headless Chromium (same approach as screenshot.js) rather than
// Satori. Each poster is captured two ways: page.pdf() sized to the A4 box for
// the print shop, and an element screenshot of `.sheet` at deviceScaleFactor
// 3.125 (= 300/96) for a pixel-exact 2480×3508 raster.

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import studentDatabase from '../src/lib/data/student-database.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// keep in sync with section-titles.ts and collateral.ts (QR_TARGETS)
const SECTION_KEYS = ['toc', 'notes', 'sites', 'archive', 'columns', 'contributors', 'colophon'];
const QR_KEYS = ['site', 'course', 'devnotes'];
const SLUGS = Object.values(studentDatabase.students).map((s) => s.slug);
const ORIENTATIONS = ['portrait', 'landscape'];

// A4 at 96 CSS-dpi; PNG multiplies by deviceScaleFactor for print resolution
// viewport is padded generously beyond the sheet so .stage centering never
// clips or reflows it before the element screenshot
const A4 = {
	portrait: { w: '210mm', h: '297mm', vw: 960, vh: 1260 },
	landscape: { w: '297mm', h: '210mm', vw: 1280, vh: 940 }
};
const DSF = 300 / 96; // 3.125 → 2480×3508 px PNG

function buildTargets({ only } = {}) {
	const t = [];
	for (const o of ORIENTATIONS) {
		t.push({ route: `print/poster/cover/${o}`, name: `cover-${o}`, orientation: o });
		for (const k of SECTION_KEYS)
			t.push({
				route: `print/poster/section/${k}/${o}`,
				name: `section-${k}-${o}`,
				orientation: o
			});
		for (const s of SLUGS)
			t.push({
				route: `print/poster/student/${s}/${o}`,
				name: `student-${s}-${o}`,
				orientation: o
			});
		for (const q of QR_KEYS)
			t.push({ route: `print/poster/qr/${q}/${o}`, name: `qr-${q}-${o}`, orientation: o });
	}
	return only ? t.filter((x) => x.name.includes(only)) : t;
}

// fonts are @font-face with display:swap — capture too early and the poster
// bakes in a fallback face. Wait until all three families are actually loaded.
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
	const { baseUrl, outputDir, pdf, png, only } = options;
	const base = `${baseUrl.replace(/\/$/, '')}/web2026/showcase`;
	const targets = buildTargets({ only });

	await fs.mkdir(outputDir, { recursive: true });
	const browser = await chromium.launch();
	console.log(`🖨️  ${targets.length} posters → ${outputDir}`);
	const results = [];

	for (let i = 0; i < targets.length; i++) {
		const { route, name, orientation } = targets[i];
		const a4 = A4[orientation];
		const page = await browser.newPage({
			viewport: { width: a4.vw, height: a4.vh },
			deviceScaleFactor: DSF
		});
		try {
			await page.goto(`${base}/${route}`, { waitUntil: 'networkidle', timeout: 45000 });
			await waitForFonts(page);
			console.log(`📄 ${i + 1}/${targets.length}: ${name}`);

			if (png) {
				const sheet = await page.locator('.sheet').first();
				await sheet.screenshot({ path: path.join(outputDir, `${name}.png`), type: 'png' });
			}
			if (pdf) {
				await page.pdf({
					path: path.join(outputDir, `${name}.pdf`),
					width: a4.w,
					height: a4.h,
					printBackground: true,
					pageRanges: '1',
					margin: { top: 0, right: 0, bottom: 0, left: 0 }
				});
			}
			results.push({ name, route, orientation });
		} catch (err) {
			console.error(`   ❌ ${name}: ${err.message}`);
			results.push({ name, route, error: err.message });
		} finally {
			await page.close();
		}
	}

	await browser.close();
	await fs.writeFile(path.join(outputDir, 'metadata.json'), JSON.stringify(results, null, 2));
	const ok = results.filter((r) => !r.error).length;
	console.log(`\n🎉 ${ok}/${results.length} posters written to ${outputDir}`);
}

// CLI
const args = process.argv.slice(2);
const opts = {
	baseUrl: process.env.POSTER_BASE_URL || 'http://localhost:4173',
	outputDir: path.join(__dirname, '..', 'collateral', 'posters'),
	pdf: true,
	png: true,
	only: null
};
for (let i = 0; i < args.length; i++) {
	const a = args[i];
	if (a === '--base-url') opts.baseUrl = args[++i];
	else if (a === '--output-dir') opts.outputDir = path.resolve(args[++i]);
	else if (a === '--only') opts.only = args[++i];
	else if (a === '--pdf') opts.png = false;
	else if (a === '--png') opts.pdf = false;
}

run(opts).catch((e) => {
	console.error(e);
	process.exit(1);
});
