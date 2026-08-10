import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// cover = the whole-showcase wall; the rest are the four exercises/assignments,
// each keyed to its screenshots.json group.
const KEYS = ['cover', 'bohemian', 'print', 'clocks', 'final'] as const;
const ORIENTATIONS = ['portrait', 'landscape'] as const;
type Key = (typeof KEYS)[number];

export const entries: EntryGenerator = () =>
	KEYS.flatMap((key) => ORIENTATIONS.map((orientation) => ({ key, orientation })));

export const load: PageLoad = async ({ params }) => {
	if (!KEYS.includes(params.key as Key)) throw error(404, 'No such collage');
	if (params.orientation !== 'portrait' && params.orientation !== 'landscape')
		throw error(404, 'Bad orientation');
	return {
		key: params.key as Key,
		orientation: params.orientation as 'portrait' | 'landscape'
	};
};
