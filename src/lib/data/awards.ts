/* The awards: seven prizes, one genuine #1 for every student. Every figure is
   pulled straight from the data — commits and word counts from the student
   database, the recurring "bits" (sign-offs, songs) from the curated quotes.
   Nothing is invented.

   Each award carries the number that earned it and one plain, human line about
   what it's for — no stats-speak. To rename a prize, reword its line, or swap a
   category, edit CATEGORIES below; it's the single source of truth. `everyoneWins`
   (checked in dev) guards the promise that all seven still take one thing home if
   the data is ever rebuilt. */

import db from '$lib/data/student-database.json';
import curated from '../../content/quotes.json';

type Student = (typeof db.students)[keyof typeof db.students];

const students = Object.values(db.students);

/* ── small honest measures over the raw data ── */
const totalWords = (s: Student) => s.devNotes.reduce((sum, n) => sum + n.wordCount, 0);

/** most commits a student ever landed on a single day */
const biggestDay = (s: Student) =>
	Math.max(0, ...Object.values(s.commitsByDate).map((commits) => commits.length));

/** standard deviation of note lengths — small means a steady hand */
const noteLengthSpread = (s: Student) => {
	const lengths = s.devNotes.map((n) => n.wordCount);
	if (!lengths.length) return 0;
	const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const variance = lengths.reduce((a, x) => a + (x - mean) ** 2, 0) / lengths.length;
	return Math.round(Math.sqrt(variance));
};

/** % change in average note length, back half of the course vs the front half */
const growthPct = (s: Student) => {
	const lengths = [...s.devNotes].sort((a, b) => a.day - b.day).map((n) => n.wordCount);
	const mid = Math.floor(lengths.length / 2);
	if (!mid || lengths.length - mid === 0) return 0;
	const front = lengths.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
	const back = lengths.slice(mid).reduce((a, b) => a + b, 0) / (lengths.length - mid);
	return front ? Math.round(((back - front) / front) * 100) : 0;
};

const countBy = (list: readonly { author?: string }[], name: string) =>
	list.filter((x) => x.author === name).length;

/* ── the prizes (edit names, lines, and copy here) ── */
interface Category {
	id: string;
	title: string; // the prize name
	blurb: string; // one plain line: what it's for
	unit: string; // the tiny label under the stamped number
	dir?: 'max' | 'min'; // default 'max'
	value: (s: Student) => number;
	stamp?: (v: number) => string; // how the number reads on the seal
}

const CATEGORIES: Category[] = [
	{
		id: 'commits',
		title: 'Push It',
		blurb: 'Saved, committed and shipped more than anyone — the busiest hands in the repo.',
		unit: 'commits',
		value: (s) => s.statistics.totalCommits
	},
	{
		id: 'words',
		title: 'The Novelist',
		blurb: 'Turned every dev note into a short story.',
		unit: 'words',
		value: totalWords
	},
	{
		id: 'push',
		title: 'The Big Push',
		blurb: 'Went quiet, then shipped a whole project in a single deadline-day sitting.',
		unit: 'in a day',
		value: biggestDay
	},
	{
		id: 'signoffs',
		title: 'Never Left Quietly',
		blurb: 'Never once logged off without a proper goodbye.',
		unit: 'goodbyes',
		value: (s) => countBy(curated.signoffs, s.name)
	},
	{
		id: 'improved',
		title: 'Found Their Voice',
		blurb: 'Started with a line or two, ended up writing essays.',
		unit: 'longer',
		value: growthPct,
		stamp: (v) => `+${v}%`
	},
	{
		id: 'steadiest',
		title: 'Steady Hand',
		blurb: 'Same shape, same length, every single day.',
		unit: 'words',
		dir: 'min',
		value: noteLengthSpread,
		stamp: (v) => `±${v}`
	},
	{
		id: 'songs',
		title: 'Class DJ',
		blurb: 'Brought the soundtrack — a song rec on just about every note.',
		unit: 'song recs',
		value: (s) => countBy(curated.songs, s.name)
	}
];

export interface Award {
	id: string;
	title: string;
	blurb: string;
	stamp: string; // the number as it reads on the seal
	unit: string;
	winners: { name: string; slug: string }[];
}

const rank = (cat: Category) =>
	students
		.map((s) => ({ name: s.name, slug: s.slug, value: cat.value(s) }))
		.sort((a, b) => (cat.dir === 'min' ? a.value - b.value : b.value - a.value));

export const awards: Award[] = CATEGORIES.map((cat) => {
	const ranked = rank(cat);
	const top = ranked[0];
	return {
		id: cat.id,
		title: cat.title,
		blurb: cat.blurb,
		unit: cat.unit,
		stamp: cat.stamp ? cat.stamp(top.value) : top.value.toLocaleString(),
		winners: ranked.filter((r) => r.value === top.value).map(({ name, slug }) => ({ name, slug }))
	};
});

/* Guarantee: every student takes home at least one prize. */
const covered = new Set(awards.flatMap((a) => a.winners.map((w) => w.slug)));
export const everyoneWins = students.every((s) => covered.has(s.slug));

if (import.meta.env.DEV && !everyoneWins) {
	const missing = students.filter((s) => !covered.has(s.slug)).map((s) => s.name);
	console.warn(`[awards] no prize for: ${missing.join(', ')} — retune CATEGORIES in awards.ts`);
}
