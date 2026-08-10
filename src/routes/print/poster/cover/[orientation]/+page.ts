import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

const ORIENTATIONS = ['portrait', 'landscape'] as const;

export const entries: EntryGenerator = () => ORIENTATIONS.map((orientation) => ({ orientation }));

export const load: PageLoad = ({ params }) => {
	if (params.orientation !== 'portrait' && params.orientation !== 'landscape')
		throw error(404, 'Bad orientation');
	return { orientation: params.orientation as 'portrait' | 'landscape' };
};
