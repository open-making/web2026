import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** The site lives at teaching.aman.bh/web2026/showcase via a Netlify 200-rewrite proxy. */
const BASE_PATH = '/web2026/showcase';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		// paths.base makes the client router, prerendered links, and the SPA
		// fallback all carry the /web2026/showcase prefix.
		//
		// relative:false -> ABSOLUTE asset URLs (/web2026/showcase/_app/...).
		// Required because the entry URL is visited without a trailing slash
		// (/web2026/showcase), and relative "./_app/..." would resolve against
		// the parent (/web2026/), dropping the prefix.
		paths: { base: BASE_PATH, relative: false },
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$utils: 'src/lib/utils',
			$hooks: 'src/lib/hooks'
		},
		prerender: {
			// webring.json is fetched at runtime by the embeddable widget and is not
			// linked from any page, so name it explicitly for the crawler.
			entries: ['*', '/webring.json'],
			// student dev notes contain arbitrary markdown links that the crawler
			// follows; a bad relative link in a note should not fail the build
			handleHttpError: ({ path, referrer, message }) => {
				console.warn(`prerender: ${message} (${path} linked from ${referrer})`);
			}
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
