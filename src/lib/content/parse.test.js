import { describe, expect, it } from 'vitest';
import { excerptMarkdown, parseStory, readTime, selectStories, toCard } from './parse.js';

const DIR = '/src/content/stories/demo';
const assetKeys = new Set([`${DIR}/photo.jpg`, `${DIR}/photo-2.jpg`, `${DIR}/clip.jpg`]);
const BODY = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
const BASE = {
	title: 'Demo story',
	dek: 'A demo dek',
	type: 'food',
	date: '2026-10-03',
	images: [{ src: './photo.jpg', alt: 'A plate of food' }]
};

/** JSON is valid YAML, so fixtures can be plain objects. */
function raw(data, body = BODY) {
	return `---\n${JSON.stringify(data)}\n---\n${body}`;
}

function parse(data, body) {
	return parseStory({ slug: 'demo', raw: raw(data, body), assetKeys });
}

describe('parseStory', () => {
	it('parses a valid original story with defaults', () => {
		const story = parse(BASE);
		expect(story).toMatchObject({
			slug: 'demo',
			title: 'Demo story',
			type: 'food',
			date: '2026-10-03',
			sourceUrl: null,
			fullText: true,
			featured: false,
			indexable: true,
			clipping: null,
			images: [{ key: `${DIR}/photo.jpg`, alt: 'A plate of food', caption: null, credit: null }]
		});
		expect(story.html).toContain('Third paragraph.');
	});

	it('accepts unquoted YAML dates', () => {
		const yaml = `---\ntitle: T\ndek: D\ntype: travel\ndate: 2026-01-22\nimages:\n  - { src: ./photo.jpg, alt: Hills }\n---\nBody`;
		expect(parseStory({ slug: 'demo', raw: yaml, assetKeys }).date).toBe('2026-01-22');
	});

	it.each(['title', 'dek', 'type', 'date', 'images'])('rejects a missing %s', (field) => {
		const data = { ...BASE };
		delete data[field];
		expect(() => parse(data)).toThrow(`demo/index.md: missing required field "${field}"`);
	});

	it('rejects an unknown type', () => {
		expect(() => parse({ ...BASE, type: 'sports' })).toThrow(
			'type must be one of food, culture, travel'
		);
	});

	it('rejects an invalid date', () => {
		expect(() => parse({ ...BASE, date: 'October 3' })).toThrow('date must be a YYYY-MM-DD date');
	});

	it('rejects zero or more than three images', () => {
		expect(() => parse({ ...BASE, images: [] })).toThrow('images must list 1 to 3 photos');
		const four = Array(4).fill({ src: './photo.jpg', alt: 'x' });
		expect(() => parse({ ...BASE, images: four })).toThrow('images must list 1 to 3 photos');
	});

	it('rejects image paths that do not exist or are not relative', () => {
		expect(() => parse({ ...BASE, images: [{ src: './missing.jpg', alt: 'x' }] })).toThrow(
			'images[0].src "./missing.jpg" not found'
		);
		expect(() => parse({ ...BASE, images: [{ src: 'photo.jpg', alt: 'x' }] })).toThrow(
			'images[0].src must be a relative path'
		);
	});

	it('requires real alt text', () => {
		expect(() => parse({ ...BASE, images: [{ src: './photo.jpg' }] })).toThrow(
			'images[0].alt is required'
		);
		expect(() =>
			parse({ ...BASE, images: [{ src: './photo.jpg', alt: 'REPLACE: describe photo 1' }] })
		).toThrow('images[0].alt still has placeholder text');
	});

	it('resolves an optional clipping and rejects a missing one', () => {
		expect(parse({ ...BASE, clipping: './clip.jpg' }).clipping).toBe(`${DIR}/clip.jpg`);
		expect(() => parse({ ...BASE, clipping: './nope.jpg' })).toThrow(
			'clipping "./nope.jpg" not found'
		);
	});

	it('lets frontmatter override read time, for excerpts of longer pieces', () => {
		expect(parse(BASE).readTime).toBe(1);
		expect(parse({ ...BASE, readTime: 10 }).readTime).toBe(10);
		expect(() => parse({ ...BASE, readTime: 0 })).toThrow(
			'readTime must be a whole number of minutes'
		);
		expect(() => parse({ ...BASE, readTime: '5 min' })).toThrow(
			'readTime must be a whole number of minutes'
		);
	});

	it('rejects a sourceUrl that is not http(s)', () => {
		expect(() => parse({ ...BASE, sourceUrl: 'indulgexpress.com/x' })).toThrow(
			'sourceUrl must be an http(s) URL'
		);
	});

	it('shows an indexable excerpt when sourceUrl is set without fullText', () => {
		const story = parse({ ...BASE, sourceUrl: 'https://example.com/a' });
		expect(story.fullText).toBe(false);
		expect(story.indexable).toBe(true);
		expect(story.html).toContain('Second paragraph.');
		expect(story.html).not.toContain('Third paragraph.');
	});

	it('marks republished full text as not indexable', () => {
		const story = parse({ ...BASE, sourceUrl: 'https://example.com/a', fullText: true });
		expect(story.fullText).toBe(true);
		expect(story.indexable).toBe(false);
		expect(story.html).toContain('Third paragraph.');
	});

	it('forces full text for stories without a sourceUrl', () => {
		expect(parse({ ...BASE, fullText: false }).fullText).toBe(true);
	});
});

describe('excerptMarkdown', () => {
	it('cuts at the more marker when present', () => {
		expect(excerptMarkdown('One.\n\nTwo.\n\nThree.\n\n<!-- more -->\n\nFour.')).toBe(
			'One.\n\nTwo.\n\nThree.'
		);
	});

	it('falls back to the first two paragraphs', () => {
		expect(excerptMarkdown(BODY)).toBe('First paragraph.\n\nSecond paragraph.');
	});
});

describe('readTime', () => {
	it('rounds up at 200 words per minute, minimum one', () => {
		expect(readTime('word '.repeat(450))).toBe(3);
		expect(readTime('short')).toBe(1);
	});
});

describe('selectStories and toCard', () => {
	const a = parse({ ...BASE, title: 'Old', date: '2025-01-01' });
	const b = { ...parse({ ...BASE, title: 'New', type: 'travel', featured: true }), slug: 'new' };

	it('sorts newest first and filters', () => {
		expect(selectStories([a, b]).map((s) => s.title)).toEqual(['New', 'Old']);
		expect(selectStories([a, b], { type: 'food' }).map((s) => s.title)).toEqual(['Old']);
		expect(selectStories([a, b], { featured: true }).map((s) => s.title)).toEqual(['New']);
	});

	it('reduces a story to card data', () => {
		expect(toCard(a)).toEqual({
			slug: 'demo',
			title: 'Old',
			dek: 'A demo dek',
			type: 'food',
			date: '2025-01-01',
			venue: null,
			readTime: 1,
			cover: `${DIR}/photo.jpg`
		});
	});
});
