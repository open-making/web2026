import { error } from '@sveltejs/kit';
import studentDatabase from '$lib/data/student-database.json';
import type { EntryGenerator, PageLoad } from './$types';

const bySlug = Object.fromEntries(
	Object.values(studentDatabase.students).map((s) => [s.slug, s.username])
);

export const entries: EntryGenerator = () =>
	Object.keys(bySlug).map((student) => ({ student }));

export const load: PageLoad = async ({ params }) => {
	const username = bySlug[params.student];
	if (!username) throw error(404, 'No such contributor');

	const data = await import(`$lib/data/students/${username}.json`);
	return { student: data.default };
};
