<script>
	import { onMount } from 'svelte';

	let { data } = $props();
	let posts = data.posts;
</script>

<section class="places-section">
	<h1>Places I've Visited</h1>
	{#if posts && posts.length > 0}
		<div class="places-grid">
			{#each posts as post}
				<div class="place-card">
					<!-- <img src={post.imageUrl} alt={post.title} /> -->
					<h2>{post.title}</h2>
					<p>{post.description}</p>
					<a href={`/places/${post.slug}`} class="view-more">View More</a>
				</div>
			{/each}
		</div>
	{:else}
		<p>No places to display at the moment. Please check back later!</p>
	{/if}
</section>
