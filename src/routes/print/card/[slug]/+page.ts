import { error } from '@sveltejs/kit';
import studentDatabase from '$lib/data/student-database.json';
import { studentUrl } from '$lib/data/collateral';
import { qrSvg } from '$lib/utils/qr';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

const bySlug = Object.fromEntries(
	Object.values(studentDatabase.students).map((s) => [s.slug, s])
);

export const entries: EntryGenerator = () =>
	Object.keys(bySlug).map((slug) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const student = bySlug[params.slug];
	if (!student) throw error(404, 'No such contributor');

	// the card points at their showcase page; blue ink so it prints one clean pass
	return {
		student,
		url: studentUrl(student.slug),
		qr: qrSvg(studentUrl(student.slug), { ink: 'blue' })
	};
};
