import { describe, expect, it } from 'vitest';
import { buildSitemap, sitemapEntries } from './sitemap.js';

describe('sitemap', () => {
	it('lists static pages and only indexable stories', () => {
		const entries = sitemapEntries([
			{ slug: 'a', date: '2026-10-03', indexable: true },
			{ slug: 'b', date: '2026-10-04', indexable: false }
		]);
		expect(entries.map((e) => e.path)).toEqual([
			'/',
			'/stories',
			'/about',
			'/resume',
			'/stories/a'
		]);
		expect(entries.at(-1)).toEqual({ path: '/stories/a', lastmod: '2026-10-03' });
	});

	it('renders valid sitemap XML with absolute, escaped URLs', () => {
		const xml = buildSitemap('https://shivani-illakiya.com', [
			{ path: '/' },
			{ path: '/stories/a&b', lastmod: '2026-10-03' }
		]);
		expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
		expect(xml).toContain('<loc>https://shivani-illakiya.com/</loc>');
		expect(xml).toContain('<loc>https://shivani-illakiya.com/stories/a&amp;b</loc>');
		expect(xml).toContain('<lastmod>2026-10-03</lastmod>');
	});
});
