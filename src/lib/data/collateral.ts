/* One source of truth for every absolute URL the exhibition collateral needs.
   Posters and QR codes are printed and scanned off a wall — they can't use the
   base-relative paths the site uses internally; a phone needs the full origin.
   The share card's og:image is the same story. Keep all of that here. */

/** Where the showcase is actually served (Netlify 200-rewrite proxy). */
export const PROD_ORIGIN = 'https://teaching.aman.bh';
/** Mirrors svelte.config.js BASE_PATH. */
export const BASE_PATH = '/web2026/showcase';
/** Absolute site root, e.g. https://teaching.aman.bh/web2026/showcase */
export const SITE_URL = `${PROD_ORIGIN}${BASE_PATH}`;

/** Absolute URL for a student page from their slug. */
export const studentUrl = (slug: string) => `${SITE_URL}/${slug}`;

/** The course materials, same targets the BackCover links to. */
export const COURSE = {
	site: 'https://teaching.aman.bh/web2026',
	day1: 'https://teaching.aman.bh/web2026/day-1-the-small-web',
	assignments: 'https://teaching.aman.bh/web2026/assignments',
	library: 'https://teaching.aman.bh/web2026/library',
	devnotes: 'https://github.com/open-making/web2026-dev-notes'
} as const;

/** Named QR wayfinding posters. Per-student QR posters are generated separately
    from the student roster. `cta` is the ransom headline, `caption` the hand line. */
export const QR_TARGETS = {
	site: {
		url: SITE_URL,
		cta: 'see it live',
		caption: 'the whole showcase, on the web'
	},
	course: {
		url: COURSE.site,
		cta: 'the course',
		caption: 'web2026 · free & open source'
	},
	devnotes: {
		url: COURSE.devnotes,
		cta: 'dev notes',
		caption: 'every reflection, day by day, on github'
	}
} as const;

export type QrTargetKey = keyof typeof QR_TARGETS;

/** Share-card / OG copy. */
export const SHARE = {
	title: 'web2026 showcase',
	description:
		'Projects from the web2026 course at DA-IICT, Gandhinagar.',
	image: `${SITE_URL}/sharecard.jpg`,
	imageWidth: 1200,
	imageHeight: 630
} as const;
