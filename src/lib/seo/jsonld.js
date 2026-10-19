/**
 * @param {string} siteUrl
 * @param {string} path
 */
export function absoluteUrl(siteUrl, path) {
	return new URL(path, siteUrl).href;
}

/** @param {string} siteUrl */
export function personId(siteUrl) {
	return `${siteUrl}/#person`;
}

/**
 * Full Person entity. Defined once (inside the /about ProfilePage) and referenced by @id elsewhere.
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 * @param {string} [imageUrl]
 */
export function personJsonLd(site, profile, imageUrl) {
	return {
		'@type': 'Person',
		'@id': personId(site.url),
		name: profile.name,
		url: absoluteUrl(site.url, '/about'),
		jobTitle: profile.headline,
		description: profile.summary,
		...(imageUrl && { image: imageUrl }),
		email: `mailto:${profile.email}`,
		address: {
			'@type': 'PostalAddress',
			addressLocality: profile.address.locality,
			addressRegion: profile.address.region,
			addressCountry: profile.address.country
		},
		worksFor: {
			'@type': 'NewsMediaOrganization',
			name: profile.worksFor.name,
			url: profile.worksFor.url
		},
		alumniOf: profile.education.map((e) => ({
			'@type': 'CollegeOrUniversity',
			name: e.institution
		})),
		knowsAbout: profile.knowsAbout,
		sameAs: [profile.links.linkedin, profile.links.instagram, site.indulgeAuthorUrl].filter(Boolean)
	};
}

/**
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 * @param {string} [imageUrl]
 */
export function profilePageJsonLd(site, profile, imageUrl) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: absoluteUrl(site.url, '/about'),
		name: `About ${profile.name}`,
		mainEntity: personJsonLd(site, profile, imageUrl)
	};
}

/**
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 */
export function personRefJsonLd(site, profile) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': personId(site.url),
		name: profile.name,
		url: absoluteUrl(site.url, '/about')
	};
}

/**
 * @param {typeof import('$lib/data/site.js').site} site
 * @param {typeof import('$lib/data/profile.js').profile} profile
 * @param {{ slug: string, title: string, dek: string, date: string, sourceUrl: string | null, publication: string | null }} story
 * @param {string} imageUrl
 */
export function articleJsonLd(site, profile, story, imageUrl) {
	const url = absoluteUrl(site.url, `/stories/${story.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: story.title,
		description: story.dek,
		datePublished: story.date,
		image: [imageUrl],
		url,
		mainEntityOfPage: url,
		author: {
			'@type': 'Person',
			'@id': personId(site.url),
			name: profile.name,
			url: absoluteUrl(site.url, '/about')
		},
		...(story.sourceUrl && { isBasedOn: story.sourceUrl }),
		...(story.sourceUrl &&
			story.publication && { publisher: { '@type': 'Organization', name: story.publication } })
	};
}

/** @param {unknown} data */
export function serializeJsonLd(data) {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
