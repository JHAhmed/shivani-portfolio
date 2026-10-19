import { error } from '@sveltejs/kit';
import { parseStory, selectStories } from '$lib/content/parse.js';

const files = import.meta.glob('/src/content/stories/*/index.md', {
	query: '?raw',
	import: 'default',
	eager: true
});
const assetKeys = new Set(
	Object.keys(import.meta.glob('/src/content/stories/*/*.{jpg,jpeg,png,webp}'))
);

/** Parsed once at build time; any invalid story throws here and fails the build. */
const stories = Object.entries(files).map(([path, raw]) =>
	parseStory({ slug: path.split('/').at(-2) ?? '', raw: /** @type {string} */ (raw), assetKeys })
);

/** @param {{ type?: string, featured?: boolean }} [filter] */
export function getStories(filter) {
	return selectStories(stories, filter);
}

/** @param {string} slug */
export function getStory(slug) {
	const story = stories.find((s) => s.slug === slug);
	if (!story) error(404, 'Story not found');
	return story;
}
