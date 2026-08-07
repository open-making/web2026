#!/usr/bin/env node

// Screenshot the open course materials (course site + dev notes repo) for the
// back cover's "this course is open source" spread. Same viewport as the
// student-work groups so the scraps share an aspect ratio.

import { promises as fs } from 'fs';
import { takeScreenshots } from './screenshot.js';

const urls = [
	'https://teaching.aman.bh/web2026',
	'https://teaching.aman.bh/web2026/day-1-the-small-web',
	'https://teaching.aman.bh/web2026/assignments',
	'https://teaching.aman.bh/web2026/library',
	'https://github.com/open-making/web2026-dev-notes'
];

const results = await takeScreenshots(urls, {
	outputDir: 'src/lib/assets/images/open',
	fullPage: false,
	width: 1200,
	height: 900,
	format: 'webp',
	quality: 82
});

const index = {};
for (const r of results) {
	if (r.filename && !r.error) index[r.url] = r.filename;
}
await fs.writeFile('src/lib/assets/images/open/index.json', JSON.stringify(index, null, 2));
console.log('✅ open materials done');
