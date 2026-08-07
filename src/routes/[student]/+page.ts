import { error } from '@sveltejs/kit';
import studentDatabase from '$lib/data/student-database.json';
import seasonStats from '$lib/data/season-stats.json';
import curated from '../../content/quotes.json';
import type { EntryGenerator, PageLoad } from './$types';

const bySlug = Object.fromEntries(
	Object.values(studentDatabase.students).map((s) => [s.slug, s.username])
);

// optional instructor note per student, plain markdown in src/content/notes/
const notes = import.meta.glob('/src/content/notes/*.md', {
	query: '?raw',
	import: 'default'
});

export const entries: EntryGenerator = () => Object.keys(bySlug).map((student) => ({ student }));

export const load: PageLoad = async ({ params }) => {
	const username = bySlug[params.student];
	if (!username) throw error(404, 'No such contributor');

	const data = await import(`$lib/data/students/${username}.json`);
	const student = data.default;

	const notePath = `/src/content/notes/${username}.md`;
	const instructorNote = notes[notePath] ? ((await notes[notePath]()) as string) : null;

	const dateByDay = new Map(seasonStats.days.map((d) => [d.day, d.date]));
	const sentiment = (
		seasonStats.perStudent[username as keyof typeof seasonStats.perStudent] ?? []
	).map((d) => ({ ...d, date: dateByDay.get(d.day) ?? null }));

	return {
		student,
		sentiment,
		quotes: curated.quotes.filter((q) => q.author === student.name),
		instructorNote
	};
};
