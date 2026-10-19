import { toCard } from '$lib/content/parse.js';
import { getStories } from '$lib/server/stories.js';

export function load() {
	return { stories: getStories().map(toCard) };
}
