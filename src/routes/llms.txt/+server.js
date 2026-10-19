import { profile } from '$lib/data/profile.js';
import { site } from '$lib/data/site.js';
import { getStories } from '$lib/server/stories.js';
import { buildLlmsTxt } from '$lib/seo/llms.js';

export const prerender = true;

export function GET() {
	return new Response(buildLlmsTxt({ site, profile, stories: getStories() }), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
