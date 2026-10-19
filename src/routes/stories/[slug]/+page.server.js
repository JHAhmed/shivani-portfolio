import { getStories, getStory } from '$lib/server/stories.js';

export function entries() {
	return getStories().map((story) => ({ slug: story.slug }));
}

/** @param {{ params: { slug: string } }} event */
export function load({ params }) {
	return { story: getStory(params.slug) };
}
