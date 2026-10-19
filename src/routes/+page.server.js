import { toCard } from '$lib/content/parse.js';
import { getStories } from '$lib/server/stories.js';

export function load() {
	const featured = getStories({ featured: true });
	const stories = (featured.length ? featured : getStories()).slice(0, 6).map(toCard);
	return { stories };
}
