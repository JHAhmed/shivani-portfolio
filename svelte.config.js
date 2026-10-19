import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		prerender: {
			entries: ['*'],
			// TEMPORARY: the nav links to pages that later tasks create. Task 12 removes this line
			// so broken links fail the build again.
			handleHttpError: 'warn'
		}
	}
};

export default config;
