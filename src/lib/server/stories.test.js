import { describe, expect, it } from 'vitest';
import { getStories, getStory } from './stories.js';

describe('repository stories', () => {
	it('has at least one story of each type', () => {
		const types = new Set(getStories().map((s) => s.type));
		expect([...types].sort()).toEqual(['culture', 'food', 'travel']);
	});

	it('has at least one featured story', () => {
		expect(getStories({ featured: true }).length).toBeGreaterThan(0);
	});

	it('throws a 404 for an unknown slug', () => {
		/** @type {any} */
		let thrown;
		try {
			getStory('does-not-exist');
		} catch (e) {
			thrown = e;
		}
		expect(thrown?.status).toBe(404);
	});
});
