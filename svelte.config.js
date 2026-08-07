import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({
			edge: false
		}),
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$utils: 'src/lib/utils',
			$hooks: 'src/lib/hooks'
		},
		prerender: {
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
