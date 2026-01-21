<script>
	import { activeDiv } from '$lib';
	import { getRandomInt } from '$lib/utils';
	import gsap from 'gsap';
	import { Draggable } from 'gsap/Draggable';
	import { onMount } from 'svelte';
	import qrCode from '$lib/assets/qr-code.svg';
	import { blur } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	let tearable = $state(null);
	let dragging = $state(false);

	let hasDragged = $state(false);

	onMount(() => {
		gsap.registerPlugin(Draggable);

		let newDeg = getRandomInt(3, 8);

		let draggableInstance = Draggable.create(tearable, {
			type: 'x,y',
			cursor: 'grab',
			activeCursor: 'grabbing',
			dragResistance: 0.25,
			edgeResistance: 0.95,
			bounds: { minX: 0, maxX: 100, minY: -50, maxY: 50 },
			inertia: true,
			onDragStart: function () {
				hasDragged = true;

				gsap.to(tearable, {
					rotate: newDeg,
					duration: 0.5,
					ease: 'elastic.out(1, 0.3)'
				});
			},
			onDragEnd: function () {
				gsap.to(tearable, {
					rotate: newDeg - 2,
					duration: 0.5,
					ease: 'elastic.out(1, 0.3)'
				});
			}
		});

		// draggableInstance[0].addEventListener("drag", () => {
		//     tearable.style.transform = "rotateX(7deg)";
		// });
	});
</script>

<!-- use:activeDiv={'Ladakh!'} -->
<div
	class="group/ticket z-10 flex w-3/4 rounded-3xl h-96 transition-all duration-300 hover:-rotate-1 lg:w-1/2">
	<div class="h-full w-1/4 rounded-l-3xl">
		<img
			src="https://images.unsplash.com/photo-1619837374214-f5b9eb80876d?q=80&w=1974&auto=format&fit=crop"
			class="h-full rounded-l-3xl object-cover grayscale-75 transition-all duration-300 group-hover/ticket:grayscale-0"
			alt="" />
	</div>

	<div class="_rounded-r-3xl relative gap-4 flex items-center justify-center h-full w-2/4 flex-col bg-gray-300">

        <div class="flex w-1/2 items-center gap-2 justify-center text-gray-600">

            <p class="font-mono text-sm font-semibold">MAS</p>
            <div class="h-0.5 rounded-full bg-gray-600 w-12"></div>
            <Icon icon="ph:airplane-in-flight" class="size-8 " />
            <div class="h-0.5 rounded-full bg-gray-600 w-12"></div>
            <p class="font-mono text-sm font-semibold">LEH</p>
        </div>

        <h2 class="text-4xl tracking-tight font-medium">The Ladakh Story</h2>

        <p class="font-mono text-sm text-gray-700">22th Jan 2026 | 3:56 AM</p>

        <a href="" class="mt-4">
            <div class="rounded-full group bg-white text-black border-2 active:hard-shadow-md border-black hard-shadow-sm hover:hard-shadow-base px-6 py-2  transition-all duration-300">
                <p class="text-black font-semibold inline-flex items-center justify-center">Read Here
                    <!-- <Icon icon="ph:caret-right-bold" class="inline size-5 ml-1 group-hover:ml-3" /> -->
                </p>
            </div>
        </a>


		<p class="absolute -right-6 bottom-1/2 -rotate-90 font-mono text-gray-600">Tear Here</p>
	</div>

	<div
		bind:this={tearable}
		class="relative flex h-full w-1/4 flex-col rounded-r-3xl border-l-2 border-dashed border-gray-400 bg-amber-200 shadow-lg">
		{#if !hasDragged}
			<div transition:blur class="absolute -top-8 left-1/2 -translate-x-1/2">
				<p class="font-handwriting">Drag Me!</p>
			</div>
		{/if}

		<div class="flex h-full flex-col items-start justify-between gap-4 p-4">
			<div class="">
				<p class="text-xs">Passenger</p>
				<p class="font-mono">Shivani Illakiya</p>
			</div>

			<div class="flex w-full items-center justify-start gap-6">
				<div class="">
					<p class="text-xs">Gate</p>
					<p class="font-mono">4</p>
				</div>
				<div class="">
					<p class="text-xs">Boarding</p>
					<p class="font-mono">7:45 AM</p>
				</div>
			</div>

			<div class="">
				<!-- <p class="text-xs">Passenger</p> -->
				<p class="font-mono">Flight IN0330</p>
				<p class="font-mono text-gray-700">Terminal B</p>
			</div>

			<div class="flex w-full flex-col items-center justify-center gap-2 rounded-2xl">
				<p class="font-mono tracking-wider">Scan Me!</p>
				<img src={qrCode} class="w-20" alt="" />
			</div>
		</div>
	</div>
</div>
