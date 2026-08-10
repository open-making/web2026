import { error } from '@sveltejs/kit';
import studentDatabase from '$lib/data/student-database.json';
import curated from '../../../../../../content/quotes.json';
import { studentUrl } from '$lib/data/collateral';
import { qrSvg } from '$lib/utils/qr';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

const ORIENTATIONS = ['portrait', 'landscape'] as const;
const bySlug = Object.fromEntries(
	Object.values(studentDatabase.students).map((s) => [s.slug, s.username])
);

export const entries: EntryGenerator = () =>
	Object.keys(bySlug).flatMap((slug) => ORIENTATIONS.map((orientation) => ({ slug, orientation })));

export const load: PageLoad = async ({ params }) => {
	const username = bySlug[params.slug];
	if (!username) throw error(404, 'No such contributor');
	if (params.orientation !== 'portrait' && params.orientation !== 'landscape')
		throw error(404, 'Bad orientation');

	const data = await import(`$lib/data/students/${username}.json`);
	const student = data.default;

	// a couple of their own lines to letter across the poster (shortest read best)
	const mine = curated.quotes
		.filter((q) => q.author === student.name && q.text.length < 110)
		.sort((a, b) => a.text.length - b.text.length);
	const quote = mine[0] ? { text: mine[0].text.replace(/\*\*/g, ''), day: mine[0].day } : null;

	return {
		student,
		quote,
		orientation: params.orientation as 'portrait' | 'landscape',
		qr: qrSvg(studentUrl(params.slug), { ink: 'blue' })
	};
};
