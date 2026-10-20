<script>
	import LuggageTag from '$lib/components/LuggageTag.svelte';
	import { profile } from '$lib/data/profile.js';
	import { buildYear, site } from '$lib/data/site.js';

	const links = [
		{ href: profile.links.linkedin, label: 'LinkedIn', rel: 'me' },
		{ href: profile.links.instagram, label: 'Instagram', rel: 'me' },
		{ href: site.indulgeAuthorUrl, label: 'My work on Indulge', rel: undefined }
	].filter((link) => link.href);
</script>

<footer id="contact" class="mt-12 border-t border-line">
	<div
		class="mx-auto flex max-w-6xl flex-col items-start gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight">Get in touch</h2>
			<p class="mt-2 max-w-md text-muted">
				For assignments, collaborations or a conversation about food, write to me.
			</p>
			<ul class="mt-4 flex flex-wrap gap-x-6 gap-y-1">
				{#each links as link (link.label)}
					<li>
						<a
							href={link.href}
							rel={link.rel}
							class="inline-flex min-h-11 items-center underline underline-offset-4"
							>{link.label}</a>
					</li>
				{/each}
				<li>
					<a
						href={site.resumePdf}
						target="_blank"
						class="inline-flex min-h-11 items-center underline underline-offset-4">Resume (PDF)</a>
				</li>
			</ul>
		</div>
		<LuggageTag />
	</div>

	<div class="flex w-full justify-between mx-auto max-w-6xl">
		<p class="px-4 pb-8 text-sm text-muted sm:px-6">© {buildYear} {site.name}</p>

		<a
			href="https://wurks.studio/"
			target="_blank"
			rel="noopener noreferrer"
			class="font-normal text-sm text-gray-600 px-4"
			>By <span
				class="font-semibold text-purple-600 decoration-purple-600 decoration-1 underline-offset-2 hover:underline"
				>Wurks</span
			>.</a>
	</div>
</footer>
