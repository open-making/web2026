#!/usr/bin/env node

// Score sentiment per day and per (student, day) from the fetched database.
// Shells out once to sentiment-batch.py (model loads a single time), caches by
// content hash so re-runs only score new or edited notes.
// Usage: node scripts/run-sentiment.js [--python <path>]

import fs from 'fs/promises';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';

const argPython = process.argv.indexOf('--python');
const PYTHON =
	argPython !== -1
		? process.argv[argPython + 1]
		: '/Users/amnbh/Desktop/dump/web2026-dev-notes/.venv-sentiment/bin/python';

const db = JSON.parse(await fs.readFile('src/lib/data/student-database.json', 'utf8'));

let cache = { hashes: {}, byDay: {}, byStudentDay: {} };
try {
	cache = JSON.parse(await fs.readFile('src/lib/data/sentiment-cache.json', 'utf8'));
} catch {
	/* first run */
}

const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

// group notes per day and per student-day, then combine exactly like the
// dev-notes repo's update-readme.js does before piping to sentiment.py:
// chronological order, joined with a single space, with `'"\$ stripped.
// Scores only match the README chart if the model sees identical input.
const dayNotes = {};
const studentDayNotes = {};
for (const student of Object.values(db.students)) {
	for (const n of student.devNotes) {
		if (n.day === null || n.day === undefined) continue;
		(dayNotes[n.day] ??= []).push(n);
		(studentDayNotes[`${student.username}:${n.day}`] ??= []).push(n);
	}
}
const combine = (notes) =>
	notes
		.sort((a, b) => a.date.iso.localeCompare(b.date.iso))
		.map((n) => n.content)
		.join(' ')
		.replace(/[`'"\\$]/g, ' ');
const dayTexts = Object.fromEntries(Object.entries(dayNotes).map(([d, ns]) => [d, combine(ns)]));
const studentDayTexts = Object.fromEntries(
	Object.entries(studentDayNotes).map(([sd, ns]) => [sd, combine(ns)])
);

// only score keys whose content changed since the cache was written; texts at
// or under 50 chars score 0 without a model call, same as update-readme.js
const inputs = {};
const zeros = {};
for (const [day, text] of Object.entries(dayTexts)) {
	const key = `day:${day}`;
	if (cache.hashes[key] === hash(text)) continue;
	if (text.trim().length <= 50) zeros[key] = text;
	else inputs[key] = text;
}
for (const [sd, text] of Object.entries(studentDayTexts)) {
	const key = `sd:${sd}`;
	if (cache.hashes[key] === hash(text)) continue;
	if (text.trim().length <= 50) zeros[key] = text;
	else inputs[key] = text;
}

if (Object.keys(inputs).length === 0 && Object.keys(zeros).length === 0) {
	console.log('✅ sentiment cache is current, nothing to score');
	process.exit(0);
}

let scores = {};
if (Object.keys(inputs).length > 0) {
	console.log(`scoring ${Object.keys(inputs).length} texts with ${PYTHON}...`);
	const res = spawnSync(PYTHON, ['scripts/sentiment-batch.py'], {
		input: JSON.stringify(inputs),
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		stdio: ['pipe', 'pipe', 'inherit']
	});
	if (res.status !== 0) {
		console.error('❌ sentiment batch failed');
		process.exit(1);
	}
	scores = JSON.parse(res.stdout);
}
for (const key of Object.keys(zeros)) scores[key] = 0;

for (const [key, val] of Object.entries(scores)) {
	if (key.startsWith('day:')) cache.byDay[key.slice(4)] = val;
	else cache.byStudentDay[key.slice(3)] = val;
	cache.hashes[key] = hash(inputs[key] ?? zeros[key]);
}

await fs.writeFile('src/lib/data/sentiment-cache.json', JSON.stringify(cache, null, 2));
console.log(`✅ sentiment cache updated (${Object.keys(scores).length} new scores)`);
