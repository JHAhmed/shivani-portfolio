<script>
	import { Button } from '$lib';
	import { cursorState } from '$lib/state.svelte';
	import { backInOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	// $effect(() => {
	// 	console.log(cursorState.popupActive);
	// });

	// let hover = $state(false);
</script>

<main class="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
	<h1
		onmouseenter={() => (cursorState.popupActive = true)}
		onmouseleave={() => (cursorState.popupActive = false)}
		class="font-handwriting z-10 text-7xl font-medium">
		Shivani Illakiya
	</h1>
</main>

<!-- <div class="flex flex-col items-start justify-start gap-2">
	<h1 class="text-2xl font-medium text-black">
		Hi, I'm <br />
		<span class="font-handwriting text-7xl"> Shivani Illakiya </span>
	</h1>
	<h2 class="text-3xl font-medium text-gray-800">Journo @ Indulge Express</h2>
</div> -->
