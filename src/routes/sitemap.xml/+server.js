import { site } from '$lib/data/site.js';
import { getStories } from '$lib/server/stories.js';
import { buildSitemap, sitemapEntries } from '$lib/seo/sitemap.js';

export const prerender = true;

export function GET() {
	return new Response(buildSitemap(site.url, sitemapEntries(getStories())), {
		headers: { 'Content-Type': 'application/xml' }
	});
}
