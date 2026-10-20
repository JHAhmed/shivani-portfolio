import { TYPE_META } from '$lib/content/types.js';
import { formatDate } from '$lib/format.js';

/**
 * Build /llms.txt in the llmstxt.org format: H1, blockquote summary, prose, H2 link lists.
 * @param {{
 *   site: typeof import('$lib/data/site.js').site,
 *   profile: typeof import('$lib/data/profile.js').profile,
 *   stories: { slug: string, title: string, dek: string, type: string, date: string, publication: string | null }[]
 * }} input
 */
export function buildLlmsTxt({ site, profile, stories }) {
	/** @param {string} path */
	const abs = (path) => new URL(path, site.url).href;
	/** @param {string} label @param {string} href @param {string} [note] */
	const link = (label, href, note) => `- [${label}](${href})${note ? `: ${note}` : ''}`;

	const storyLines = stories.map((story) => {
		const details = [TYPE_META[story.type].label, formatDate(story.date), story.publication]
			.filter(Boolean)
			.join(', ');
		return link(story.title, abs(`/stories/${story.slug}`), `${story.dek} (${details})`);
	});

	return [
		`# ${profile.name}`,
		'',
		`> ${profile.headline} at ${profile.worksFor.name}, based in ${profile.location}. Writes about food, travel, and culture.`,
		'',
		profile.summary,
		'',
		'## About',
		'',
		link('About', abs('/about'), 'Bio and the beats she covers'),
		link('Resume', abs('/resume'), 'Experience, education and skills'),
		link('Resume (PDF)', abs(site.resumePdf), 'Downloadable resume'),
		'',
		'## Selected stories',
		'',
		...storyLines,
		'',
		'## Contact',
		'',
		link('Email', `mailto:${profile.email}`),
		...(profile.links.linkedin ? [link('LinkedIn', profile.links.linkedin)] : []),
		...(profile.links.instagram ? [link('Instagram', profile.links.instagram)] : []),
		link('Published work on Indulge', site.indulgeAuthorUrl, 'Archive of all her bylines'),
		''
	].join('\n');
}
