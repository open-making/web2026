#!/usr/bin/env node

// Aggregate season-wide stats from the already-fetched student database.
// No API calls — reads src/lib/data/student-database.json, writes
// src/lib/data/season-stats.json. Sentiment scores come from a separate,
// slower pass (scripts/sentiment.py) and are merged in when the cache exists.

import fs from 'fs/promises';

const IST = 'Asia/Kolkata';

const db = JSON.parse(await fs.readFile('src/lib/data/student-database.json', 'utf8'));

const allNotes = Object.values(db.students).flatMap((s) =>
	s.devNotes.map((n) => ({ ...n, author: s.username, authorName: s.name }))
);

// ── per day ──
const days = {};
for (const n of allNotes) {
	if (n.day === null || n.day === undefined) continue;
	if (!days[n.day]) {
		days[n.day] = {
			day: n.day,
			title: n.issueTitle,
			issueUrl: n.commentUrl.split('#')[0],
			date: n.date.date,
			noteCount: 0,
			totalWords: 0,
			sentiment: null
		};
	}
	days[n.day].noteCount++;
	days[n.day].totalWords += n.wordCount;
	if (n.date.date < days[n.day].date) days[n.day].date = n.date.date;
}

// ── time of day (IST), 24 bins ──
const hourFmt = new Intl.DateTimeFormat('en-GB', {
	timeZone: IST,
	hour: 'numeric',
	hour12: false
});
const hours = Array(24).fill(0);
for (const n of allNotes) {
	const h = parseInt(hourFmt.format(new Date(n.date.iso)), 10) % 24;
	hours[h]++;
}

// ── note lengths ──
const lengthBuckets = [
	{ label: 'under 50', min: 0, max: 49, count: 0 },
	{ label: '50–149', min: 50, max: 149, count: 0 },
	{ label: '150–299', min: 150, max: 299, count: 0 },
	{ label: '300–499', min: 300, max: 499, count: 0 },
	{ label: '500+', min: 500, max: Infinity, count: 0 }
];
for (const n of allNotes) {
	lengthBuckets.find((b) => n.wordCount >= b.min && n.wordCount <= b.max).count++;
}

// ── totals ──
const totalWords = allNotes.reduce((s, n) => s + n.wordCount, 0);
const longest = allNotes.reduce((max, n) => (n.wordCount > max.wordCount ? n : max), allNotes[0]);
const afterMidnight = allNotes.filter((n) => {
	const h = parseInt(hourFmt.format(new Date(n.date.iso)), 10) % 24;
	return h >= 0 && h < 5;
}).length;

// merge sentiment cache if a previous sentiment pass produced one
let sentimentByDay = {};
let sentimentByStudentDay = {};
try {
	const cache = JSON.parse(await fs.readFile('src/lib/data/sentiment-cache.json', 'utf8'));
	sentimentByDay = cache.byDay ?? {};
	sentimentByStudentDay = cache.byStudentDay ?? {};
} catch {
	console.log('ℹ️  no sentiment cache yet — sentiment fields stay null');
}
for (const d of Object.values(days)) {
	if (sentimentByDay[d.day] !== undefined) d.sentiment = sentimentByDay[d.day];
}

// per-student day/sentiment series for the contributor pages
const perStudent = {};
for (const [key, score] of Object.entries(sentimentByStudentDay)) {
	const [username, day] = key.split(':');
	if (!perStudent[username]) perStudent[username] = [];
	perStudent[username].push({ day: parseInt(day, 10), sentiment: score });
}
for (const series of Object.values(perStudent)) series.sort((a, b) => a.day - b.day);

const stats = {
	generatedAt: db.generatedAt,
	totals: {
		notes: allNotes.length,
		words: totalWords,
		students: Object.keys(db.students).length,
		averageWords: Math.round(totalWords / allNotes.length),
		longestNote: {
			words: longest.wordCount,
			author: longest.authorName,
			day: longest.day,
			commentUrl: longest.commentUrl
		},
		afterMidnight,
		afterMidnightShare: Math.round((afterMidnight / allNotes.length) * 100)
	},
	days: Object.values(days).sort((a, b) => a.day - b.day),
	hoursIST: hours,
	lengthBuckets: lengthBuckets.map(({ label, count }) => ({ label, count })),
	perStudent
};

await fs.writeFile('src/lib/data/season-stats.json', JSON.stringify(stats, null, 2));
console.log(
	`✅ season stats: ${stats.totals.notes} notes, ${stats.totals.words.toLocaleString()} words, ${stats.days.length} days`
);
