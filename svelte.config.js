import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		prerender: {
			// Endpoints aren't linked from pages, so list them explicitly. Broken links fail the build.
			entries: ['*', '/sitemap.xml', '/llms.txt']
		}
	}
};

export default config;
