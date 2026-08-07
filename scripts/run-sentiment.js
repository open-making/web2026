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

// group note text per day and per student-day
const dayTexts = {};
const studentDayTexts = {};
for (const student of Object.values(db.students)) {
	for (const n of student.devNotes) {
		if (n.day === null || n.day === undefined) continue;
		dayTexts[n.day] = (dayTexts[n.day] ?? '') + '\n\n' + n.content;
		const key = `${student.username}:${n.day}`;
		studentDayTexts[key] = (studentDayTexts[key] ?? '') + '\n\n' + n.content;
	}
}

// only score keys whose content changed since the cache was written
const inputs = {};
for (const [day, text] of Object.entries(dayTexts)) {
	const key = `day:${day}`;
	if (cache.hashes[key] !== hash(text)) inputs[key] = text;
}
for (const [sd, text] of Object.entries(studentDayTexts)) {
	const key = `sd:${sd}`;
	if (cache.hashes[key] !== hash(text)) inputs[key] = text;
}

if (Object.keys(inputs).length === 0) {
	console.log('✅ sentiment cache is current, nothing to score');
	process.exit(0);
}

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
const scores = JSON.parse(res.stdout);

for (const [key, val] of Object.entries(scores)) {
	if (key.startsWith('day:')) cache.byDay[key.slice(4)] = val;
	else cache.byStudentDay[key.slice(3)] = val;
	cache.hashes[key] = hash(inputs[key]);
}

await fs.writeFile('src/lib/data/sentiment-cache.json', JSON.stringify(cache, null, 2));
console.log(`✅ sentiment cache updated (${Object.keys(scores).length} new scores)`);
