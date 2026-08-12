import db from '$lib/data/student-database.json';
import curated from '../../content/quotes.json';

type Student = (typeof db.students)[keyof typeof db.students];

const students = Object.values(db.students);

const totalWords = (s: Student) => s.devNotes.reduce((sum, n) => sum + n.wordCount, 0);

const biggestDay = (s: Student) =>
	Math.max(0, ...Object.values(s.commitsByDate).map((commits) => commits.length));

const noteLengthSpread = (s: Student) => {
	const lengths = s.devNotes.map((n) => n.wordCount);
	if (!lengths.length) return 0;
	const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
	const variance = lengths.reduce((a, x) => a + (x - mean) ** 2, 0) / lengths.length;
	return Math.round(Math.sqrt(variance));
};

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

const emojiRe = /\p{Extended_Pictographic}/gu;
const emojiCount = (s: Student) =>
	s.devNotes.reduce((sum, n) => sum + (n.content.match(emojiRe)?.length ?? 0), 0);

interface Category {
	id: string;
	title: string; // the prize name
	blurb: string | ((v: number) => string); // one plain line: what it's for
	unit: string; // the tiny label under the stamped number
	dir?: 'max' | 'min'; // default 'max'
	value: (s: Student) => number;
	stamp?: (v: number) => string; // how the number reads on the seal
}

const CATEGORIES: Category[] = [
	{
		id: 'commits',
		title: 'Pro Committer',
		blurb: 'Saved and committed more than anyone else, maybe because of fear of accidental deletion',
		unit: 'commits',
		value: (s) => s.statistics.totalCommits
	},
	{
		id: 'words',
		title: 'The Novelist',
		blurb: 'Longest dev notes, filled with emotion and thoughts about the course and things around it',
		unit: 'words',
		value: totalWords
	},
	{
		id: 'push',
		title: 'Big Pusher',
		blurb: (v) => `Was quiet, then shipped ${v} commits in a single day's sitting.`,
		unit: 'in a day',
		value: biggestDay
	},
	{
		id: 'emoji',
		title: 'Fluent in Emoji',
		blurb: 'Dropped more emoji into the dev notes than anyone.',
		unit: 'emoji',
		value: emojiCount
	},
	{
		id: 'improved',
		title: 'Glow Up',
		blurb: 'Started writing dev notes with a line or two, ended up writing more as the course went on.',
		unit: 'longer',
		value: growthPct,
		stamp: (v) => `+${v}%`
	},
	{
		id: 'steadiest',
		title: 'Steady Hand',
		blurb: 'Most consistent and shortest, to the point dev notes. Seedhi baat, no bakwas!',
		unit: 'words',
		dir: 'min',
		value: noteLengthSpread,
		stamp: (v) => `±${v}`
	},
	{
		id: 'songs',
		title: 'Class DJ',
		blurb: 'Managed to hide the most songs in the dev notes, set to the mood of the day.',
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

// One trophy per person. Each award is a race; we hand out the most lopsided race first
// (its clear leader, judged by relative margin over the next remaining contender) and drop
// that winner from the races still open. So nobody hoards prizes — a runaway all-rounder
// takes home only their single most dominant win, and everyone else inherits the award
// they have the strongest genuine claim to. With 7 awards and 7 students it's a clean
// bijection where every seal lands on a real 1st- or 2nd-place result.
function assignWinners(): Record<string, Student> {
	const openStudents = new Set(students);
	const openCats = new Set(CATEGORIES);
	const result: Record<string, Student> = {};

	const leader = (cat: Category) => {
		const pool = [...openStudents].sort((a, b) =>
			cat.dir === 'min' ? cat.value(a) - cat.value(b) : cat.value(b) - cat.value(a)
		);
		const top = pool[0];
		const next = pool[1];
		let margin = 1; // unopposed → maximal claim
		if (next) {
			const t = cat.value(top);
			const denom = cat.dir === 'min' ? Math.abs(cat.value(next)) : Math.abs(t);
			margin = denom ? Math.abs(t - cat.value(next)) / denom : 0;
		}
		return { top, margin };
	};

	while (openCats.size > 0 && openStudents.size > 0) {
		let best: { cat: Category; top: Student; margin: number } | null = null;
		for (const cat of openCats) {
			const { top, margin } = leader(cat);
			if (!best || margin > best.margin) best = { cat, top, margin };
		}
		if (!best) break;
		result[best.cat.id] = best.top;
		openCats.delete(best.cat);
		openStudents.delete(best.top);
	}
	return result;
}

const winnerByCat = assignWinners();

export const awards: Award[] = CATEGORIES.map((cat) => {
	const winner = winnerByCat[cat.id];
	const value = winner ? cat.value(winner) : 0;
	return {
		id: cat.id,
		title: cat.title,
		blurb: typeof cat.blurb === 'function' ? cat.blurb(value) : cat.blurb,
		unit: cat.unit,
		stamp: cat.stamp ? cat.stamp(value) : value.toLocaleString(),
		winners: winner ? [{ name: winner.name, slug: winner.slug }] : []
	};
});

/* Guarantee: every student takes home at least one prize. */
const covered = new Set(awards.flatMap((a) => a.winners.map((w) => w.slug)));
export const everyoneWins = students.every((s) => covered.has(s.slug));

if (import.meta.env.DEV && !everyoneWins) {
	const missing = students.filter((s) => !covered.has(s.slug)).map((s) => s.name);
	console.warn(`[awards] no prize for: ${missing.join(', ')} — retune CATEGORIES in awards.ts`);
}
