import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// No options: adapter-static only uses Vercel's zero-config output when called bare.
		adapter: adapter(),
		prerender: {
			// Endpoints and the 404 page aren't linked from pages, so list them explicitly.
			// Broken links fail the build.
			entries: ['*', '/sitemap.xml', '/llms.txt', '/404']
		}
	}
};

export default config;
