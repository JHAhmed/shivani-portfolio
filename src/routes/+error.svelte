<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Lost luggage' : 'Something went wrong'} · Shivani Illakiya</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-xl py-24 text-center">
	<div class="mx-auto inline-block paper" style:--tilt="-2deg">
		<div
			class="bg-tag py-6 pr-10 pl-14 text-left text-tag-ink [clip-path:polygon(24px_0,100%_0,100%_100%,24px_100%,0_50%)]">
			<p class="font-mono text-xs tracking-wider uppercase">Baggage claim · {page.status}</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight">
				{page.status === 404 ? 'Lost luggage' : 'Something went wrong'}
			</h1>
		</div>
	</div>
	<p class="mt-8 text-lg text-muted">
		{page.status === 404
			? "This page isn't on any flight we know of."
			: 'Please try again in a moment.'}
	</p>
	<p class="mt-6 flex justify-center gap-6">
		<a href="/" class="font-semibold underline underline-offset-4">Home</a>
		<a href="/stories" class="font-semibold underline underline-offset-4">Stories</a>
	</p>
</section>
