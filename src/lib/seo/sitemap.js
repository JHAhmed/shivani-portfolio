const STATIC_PATHS = ['/', '/stories', '/about', '/resume'];

/** @param {string} value */
function escapeXml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** @param {{ slug: string, date: string, indexable: boolean }[]} stories */
export function sitemapEntries(stories) {
	return [
		...STATIC_PATHS.map((path) => ({ path })),
		...stories
			.filter((story) => story.indexable)
			.map((story) => ({ path: `/stories/${story.slug}`, lastmod: story.date }))
	];
}

/**
 * @param {string} siteUrl
 * @param {{ path: string, lastmod?: string }[]} entries
 */
export function buildSitemap(siteUrl, entries) {
	const urls = entries.map(({ path, lastmod }) => {
		const loc = `    <loc>${escapeXml(new URL(path, siteUrl).href)}</loc>`;
		const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
		return `  <url>\n${loc}${mod}\n  </url>`;
	});
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}
