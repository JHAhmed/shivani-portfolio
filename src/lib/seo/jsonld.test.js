import { describe, expect, it } from 'vitest';
import { profile } from '$lib/data/profile.js';
import { site } from '$lib/data/site.js';
import {
	absoluteUrl,
	articleJsonLd,
	personRefJsonLd,
	profilePageJsonLd,
	serializeJsonLd
} from './jsonld.js';

const story = {
	slug: 'demo',
	title: 'Demo',
	dek: 'A demo',
	date: '2026-10-03',
	sourceUrl: 'https://www.indulgexpress.com/x',
	publication: 'Indulge, The New Indian Express'
};

describe('jsonld', () => {
	it('builds absolute URLs', () => {
		expect(absoluteUrl(site.url, '/about')).toBe('https://shivani-illakiya.com/about');
		expect(absoluteUrl(site.url, '/')).toBe('https://shivani-illakiya.com/');
	});

	it('wraps a full Person with a stable @id in a ProfilePage', () => {
		const page = profilePageJsonLd(site, profile, 'https://shivani-illakiya.com/p.jpg');
		expect(page['@type']).toBe('ProfilePage');
		expect(page.mainEntity).toMatchObject({
			'@type': 'Person',
			'@id': 'https://shivani-illakiya.com/#person',
			name: 'Shivani Illakiya',
			jobTitle: 'Journalist and Food Correspondent',
			image: 'https://shivani-illakiya.com/p.jpg',
			worksFor: { name: 'Indulge, The New Indian Express' },
			sameAs: [site.indulgeAuthorUrl]
		});
		expect(page.mainEntity.alumniOf.map((a) => a.name)).toEqual([
			'Loyola College',
			'Ethiraj College for Women'
		]);
	});

	it('references the same person elsewhere', () => {
		expect(personRefJsonLd(site, profile)['@id']).toBe('https://shivani-illakiya.com/#person');
	});

	it('builds an Article pointing at the author page and the original', () => {
		const article = articleJsonLd(site, profile, story, 'https://shivani-illakiya.com/i.jpg');
		expect(article).toMatchObject({
			'@type': 'Article',
			headline: 'Demo',
			datePublished: '2026-10-03',
			url: 'https://shivani-illakiya.com/stories/demo',
			author: {
				'@id': 'https://shivani-illakiya.com/#person',
				url: 'https://shivani-illakiya.com/about'
			},
			isBasedOn: 'https://www.indulgexpress.com/x',
			publisher: { name: 'Indulge, The New Indian Express' }
		});
	});

	it('omits publisher fields for original stories', () => {
		const article = articleJsonLd(site, profile, { ...story, sourceUrl: null }, 'x');
		expect(article.publisher).toBeUndefined();
		expect(article.isBasedOn).toBeUndefined();
	});

	it('escapes < so JSON-LD cannot close the script tag', () => {
		expect(serializeJsonLd({ a: '</script>' })).toBe('{"a":"\\u003c/script>"}');
	});
});
