<script>
	import Seo from '$lib/components/Seo.svelte';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { personRefJsonLd } from '$lib/seo/jsonld.js';
</script>

<Seo description={site.description} path="/" jsonLd={[personRefJsonLd(site, profile)]} />

<h1 class="pt-16 text-5xl font-semibold tracking-tight">{profile.name}</h1>
<p class="mt-4 text-xl text-muted">{profile.headline}</p>
