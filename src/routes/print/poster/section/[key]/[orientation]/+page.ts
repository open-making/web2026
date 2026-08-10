import { error } from '@sveltejs/kit';
import { sections } from '$lib/data/section-titles';
import curated from '../../../../../../content/quotes.json';
import { COURSE } from '$lib/data/collateral';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

const ORIENTATIONS = ['portrait', 'landscape'] as const;

// clearer, plain-language headlines instead of the site's One Direction lyrics,
// plus which kind of visual each section poster renders under its description
const POSTER: Record<string, { title: string; kicker: string; visual: string; desc?: string }> = {
	toc: {
		title: 'The Showcase',
		kicker: 'what’s inside',
		visual: 'contents',
		desc: 'Seven designers spent twenty-five days learning to build the web end to end. Everything they made — and wrote — is collected here.'
	},
	notes: { title: 'Dev Notes', kicker: 'daily reflections', visual: 'quotes' },
	sites: { title: 'Personal Sites', kicker: 'the final projects', visual: 'sites' },
	archive: { title: 'Early Experiments', kicker: 'the warm-ups', visual: 'archive' },
	columns: { title: 'Recurring Columns', kicker: 'the regular bits', visual: 'films' },
	contributors: { title: 'The Makers', kicker: 'seven people', visual: 'people' },
	colophon: {
		title: 'Open Source',
		kicker: 'take it yourself',
		visual: 'open',
		desc: 'The full curriculum, teaching materials, and every student’s work — free and open for anyone to work through.'
	}
};

export const entries: EntryGenerator = () =>
	Object.keys(sections).flatMap((key) => ORIENTATIONS.map((orientation) => ({ key, orientation })));

export const load: PageLoad = ({ params }) => {
	const base = sections[params.key as keyof typeof sections];
	const meta = POSTER[params.key];
	if (!base || !meta) throw error(404, 'No such section');
	if (params.orientation !== 'portrait' && params.orientation !== 'landscape')
		throw error(404, 'Bad orientation');

	const desc = meta.desc ?? ('desc' in base ? base.desc : '');

	// content the visual needs that isn't an image (images resolve in the page)
	const content: Record<string, unknown> = {};
	if (meta.visual === 'quotes') {
		content.quotes = [...curated.quotes]
			.filter((q) => q.text.length < 90)
			.sort((a, b) => a.text.length - b.text.length)
			.slice(0, 6)
			.map((q) => ({ text: q.text.replace(/\*\*/g, ''), day: q.day, author: q.author }));
	} else if (meta.visual === 'films') {
		content.films = [...new Set(curated.films.map((f) => f.film))].slice(0, 8);
	} else if (meta.visual === 'contents') {
		// short one-liners so all six entries fit as a clean contents list
		const blurbs: Record<string, string> = {
			notes: 'daily reflections, fifteen days',
			sites: 'seven sites, built end to end',
			archive: 'warm-ups in HTML & CSS',
			columns: 'films, sign-offs & running bits',
			contributors: 'the seven people behind it',
			colophon: 'take the whole course yourself'
		};
		content.items = ['notes', 'sites', 'archive', 'columns', 'contributors', 'colophon'].map(
			(k) => ({ title: POSTER[k].title, desc: blurbs[k] })
		);
	} else if (meta.visual === 'open') {
		content.materials = [
			{ label: 'the course site', url: COURSE.site },
			{ label: 'day 1 · the small web', url: COURSE.day1 },
			{ label: 'the assignments', url: COURSE.assignments },
			{ label: 'the library', url: COURSE.library },
			{ label: 'the dev notes repo', url: COURSE.devnotes }
		];
		content.qrUrl = COURSE.site;
	}

	return {
		key: params.key,
		title: meta.title,
		kicker: meta.kicker,
		visual: meta.visual,
		desc,
		content,
		orientation: params.orientation as 'portrait' | 'landscape'
	};
};
