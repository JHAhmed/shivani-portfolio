<script>
	import { profile } from '$lib/data/profile.js';
</script>

<svelte:head>
	<title>{profile.name}</title>
</svelte:head>

<h1 class="pt-16 text-5xl font-semibold tracking-tight">{profile.name}</h1>
<p class="mt-4 text-xl text-muted">{profile.headline}</p>
