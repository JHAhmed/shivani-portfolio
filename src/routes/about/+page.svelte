<script>
	import portrait from '$lib/assets/portrait.jpg?enhanced&quality=80';
	import Polaroid from '$lib/components/Polaroid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { absoluteUrl, profilePageJsonLd } from '$lib/seo/jsonld.js';
</script>

<Seo
	title="About"
	description="About {profile.name}: {profile.headline} at {profile.worksFor
		.name}, covering food, travel and culture in Chennai."
	path="/about"
	type="profile"
	jsonLd={[profilePageJsonLd(site, profile, absoluteUrl(site.url, portrait.img.src))]} />

<section class="grid gap-12 pt-12 md:grid-cols-[1fr_1.5fr] md:items-start">
	<div class="mx-auto w-60 md:mt-6">
		<Polaroid src={portrait} alt="Portrait of Shivani Illakiya" caption="Chennai" tilt={-3} />
	</div>
	<div>
		<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">About</h1>
		{#each profile.bio as paragraph (paragraph)}
			<p class="mt-5 text-lg leading-relaxed">{paragraph}</p>
		{/each}

		<h2 class="mt-12 text-2xl font-semibold tracking-tight">What I cover</h2>
		<ul class="mt-4 flex flex-wrap gap-2">
			{#each profile.beats as beat (beat)}
				<li class="rounded-full border border-ink/20 bg-receipt px-4 py-1.5">{beat}</li>
			{/each}
		</ul>

		<div class="mt-10 flex flex-wrap gap-3">
			<a
				href="/stories"
				class="inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-ink/85"
				>Read my stories</a>
			<a
				href="/resume"
				class="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-6 font-semibold hover:border-ink"
				>View resume</a>
		</div>
	</div>
</section>
