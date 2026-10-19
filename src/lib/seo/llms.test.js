import { describe, expect, it } from 'vitest';
import { profile } from '$lib/data/profile.js';
import { site } from '$lib/data/site.js';
import { buildLlmsTxt } from './llms.js';

const stories = [
	{
		slug: 'demo',
		title: 'Demo story',
		dek: 'A demo dek',
		type: 'food',
		date: '2026-10-03',
		publication: 'Indulge, The New Indian Express'
	}
];

describe('llms.txt', () => {
	const text = buildLlmsTxt({ site, profile, stories });

	it('follows the llmstxt.org shape: H1, blockquote, then H2 link lists', () => {
		const lines = text.split('\n');
		expect(lines[0]).toBe('# Shivani Illakiya');
		expect(lines[2]).toMatch(/^> Journalist and Food Correspondent at Indulge/);
		expect(text).toContain('## About');
		expect(text).toContain('## Selected stories');
		expect(text).toContain('## Contact');
	});

	it('links stories with their dek, type, date and publication', () => {
		expect(text).toContain(
			'- [Demo story](https://shivani-illakiya.com/stories/demo): A demo dek (Food, 3 Oct 2026, Indulge, The New Indian Express)'
		);
	});

	it('links the HTML and PDF resume and omits missing social links', () => {
		expect(text).toContain('(https://shivani-illakiya.com/resume)');
		expect(text).toContain('(https://shivani-illakiya.com/Shivani-Illakiya-Resume.pdf)');
		expect(text).not.toContain('LinkedIn');
	});
});
