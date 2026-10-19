import matter from 'gray-matter';
import { marked } from 'marked';
import { STORY_TYPES } from './types.js';

const MORE = '<!-- more -->';
const WORDS_PER_MINUTE = 200;
const REQUIRED = ['title', 'dek', 'type', 'date', 'images'];
const PLACEHOLDER_ALT = /^(replace|todo)\b/i;

/** @typedef {{ key: string, alt: string, caption: string | null, credit: string | null }} StoryImage */
/**
 * @typedef {{
 *   slug: string, title: string, dek: string, type: string, date: string,
 *   venue: string | null, publication: string | null, sourceUrl: string | null,
 *   fullText: boolean, context: string | null, featured: boolean,
 *   images: StoryImage[], clipping: string | null, readTime: number,
 *   html: string, indexable: boolean
 * }} Story
 */
/**
 * @typedef {{ slug: string, title: string, dek: string, type: string, date: string,
 *   venue: string | null, readTime: number, cover: string }} StoryCardData
 */

/** @param {unknown} value */
export function toIsoDate(value) {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) ? null : value;
	}
	return null;
}

/** @param {string} markdown */
export function readTime(markdown) {
	const words = markdown.replace(MORE, ' ').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** @param {string} markdown */
export function excerptMarkdown(markdown) {
	const cut = markdown.indexOf(MORE);
	if (cut !== -1) return markdown.slice(0, cut).trim();
	return markdown
		.trim()
		.split(/\n\s*\n/)
		.filter((block) => block.trim())
		.slice(0, 2)
		.join('\n\n');
}

/**
 * @param {string} file
 * @param {string} slug
 * @param {unknown} src
 * @param {string} label
 * @param {Set<string>} assetKeys
 */
function resolveAsset(file, slug, src, label, assetKeys) {
	if (typeof src !== 'string' || !src.startsWith('./')) {
		throw new Error(`${file}: ${label} must be a relative path like "./photo.jpg"`);
	}
	const key = `/src/content/stories/${slug}/${src.slice(2)}`;
	if (!assetKeys.has(key)) throw new Error(`${file}: ${label} "${src}" not found next to index.md`);
	return key;
}

/**
 * Parse and validate one story. Throws with the file and field named, so a bad story fails the build.
 * @param {{ slug: string, raw: string, assetKeys: Set<string> }} input
 * @returns {Story}
 */
export function parseStory({ slug, raw, assetKeys }) {
	const file = `${slug}/index.md`;
	const { data, content } = matter(raw);

	for (const field of REQUIRED) {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			throw new Error(`${file}: missing required field "${field}"`);
		}
	}
	if (!STORY_TYPES.includes(data.type)) {
		throw new Error(`${file}: type must be one of ${STORY_TYPES.join(', ')} (got "${data.type}")`);
	}
	const date = toIsoDate(data.date);
	if (!date) throw new Error(`${file}: date must be a YYYY-MM-DD date`);
	if (!Array.isArray(data.images) || data.images.length < 1 || data.images.length > 3) {
		throw new Error(`${file}: images must list 1 to 3 photos`);
	}

	const images = data.images.map((image, i) => {
		const label = `images[${i}]`;
		const key = resolveAsset(file, slug, image?.src, `${label}.src`, assetKeys);
		const alt = typeof image.alt === 'string' ? image.alt.trim() : '';
		if (!alt) throw new Error(`${file}: ${label}.alt is required`);
		if (PLACEHOLDER_ALT.test(alt))
			throw new Error(`${file}: ${label}.alt still has placeholder text`);
		return { key, alt, caption: image.caption ?? null, credit: image.credit ?? null };
	});

	const sourceUrl = data.sourceUrl ?? null;
	if (sourceUrl !== null && !/^https?:\/\/\S+$/.test(sourceUrl)) {
		throw new Error(`${file}: sourceUrl must be an http(s) URL`);
	}
	const fullText = sourceUrl ? data.fullText === true : true;

	return {
		slug,
		title: String(data.title),
		dek: String(data.dek),
		type: data.type,
		date,
		venue: data.venue ?? null,
		publication: data.publication ?? null,
		sourceUrl,
		fullText,
		context: data.context ?? null,
		featured: data.featured === true,
		images,
		clipping: data.clipping ? resolveAsset(file, slug, data.clipping, 'clipping', assetKeys) : null,
		readTime: readTime(content),
		html: /** @type {string} */ (
			marked.parse(fullText ? content : excerptMarkdown(content), { async: false })
		),
		indexable: !(sourceUrl && fullText)
	};
}

/**
 * @param {Story[]} stories
 * @param {{ type?: string, featured?: boolean }} [filter]
 */
export function selectStories(stories, { type, featured } = {}) {
	return stories
		.filter((s) => (!type || s.type === type) && (!featured || s.featured))
		.toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/**
 * @param {Story} story
 * @returns {StoryCardData}
 */
export function toCard(story) {
	return {
		slug: story.slug,
		title: story.title,
		dek: story.dek,
		type: story.type,
		date: story.date,
		venue: story.venue,
		readTime: story.readTime,
		cover: story.images[0].key
	};
}
