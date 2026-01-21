<script>
	import Ticket from '$components/Ticket.svelte';
	import { activeDiv, Button } from '$lib';
	import { cursorState } from '$lib/state.svelte';
	import { getRandomInt } from '$lib/utils';
	import { backInOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	// $effect(() => {
	// 	console.log(cursorState.popupActive);
	// });

	// let hover = $state(false);
</script>

<main class="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 gap-12">
	<h1 use:activeDiv={'Hello there!'} class="z-10 font-handwriting text-7xl font-medium">
		Shivani Illakiya
	</h1>

	<Ticket />

	<!-- <div class="relative w-[90%] mx-auto">
		{#each Array(3) as _, i}
		<div style="rotate: {getRandomInt(-3, 3)}deg;" class="absolute w-full">
			<Ticket />
		</div>
		{/each}
	</div> -->

</main>

<!-- <div class="flex flex-col items-start justify-start gap-2">
	<h1 class="text-2xl font-medium text-black">
		Hi, I'm <br />
		<span class="font-handwriting text-7xl"> Shivani Illakiya </span>
	</h1>
	<h2 class="text-3xl font-medium text-gray-800">Journo @ Indulge Express</h2>
</div> -->
