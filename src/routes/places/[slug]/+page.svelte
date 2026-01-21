<script>
	import { astToHtmlString } from '@graphcms/rich-text-html-renderer';
	export let data;
	const post = data.post;

	const html = astToHtmlString({
		content: post.content.raw,
		references: post.content.references || [],
		renderers: {
			Asset: {
				audio: ({ url, fileName }) => `
					<figure class="rt-audio my-4">
						<figcaption class="text-slate-500 mb-2">${fileName ?? 'Audio'}</figcaption>
						<audio controls src="${url}" class="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
								Your browser doesn't support audio
						</audio>
					</figure>
				`,
				image: ({ url, alt }) => `<img src="${url}" alt="${alt || ''}" class="rounded-md shadow-sm mx-auto">`
			}
		}
	});
</script>

<article class="mx-auto my-4 prose max-w-4xl py-8 lg:prose-xl px-4 prose-h1:mb-0 prose-h2:mt-2 prose-h2:text-sm prose-figcaption:text-sm">
	<div class="mb-4 space-y-0">
        <h1 class="text-4xl mb-0 font-medium tracking-tight">{post.title}</h1>
        <h2 class="text-sm">Shivani Illakiya</h2>
    </div>
	<p class="text-left text-lg">{post.description}</p>

	<!-- Render HTML produced by astToHtmlString -->
	<div>{@html html}</div>
</article>
