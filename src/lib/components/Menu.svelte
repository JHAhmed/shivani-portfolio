<script>
	import Icon from '@iconify/svelte';
	import { fly, slide } from 'svelte/transition';
	import { backInOut, cubicInOut, quintInOut } from 'svelte/easing';
	import gsap from 'gsap';

	import MorphSVGPlugin from 'gsap/MorphSVGPlugin';
	import { onMount } from 'svelte';

	let xSVG = $state(null);
	let menuSVG = $state(null);
	let overlayActive = $state(false);

	let menuItems = [
		{
			href: '/',
			label: 'Home',
			icon: 'ph:house-duotone',
			iconFilled: 'ph:house-fill'
		},
		{
			href: '/places',
			label: 'Places',
			icon: 'ph:map-pin-duotone',
			iconFilled: 'ph:map-pin-fill'
		},
		{
			href: '/pictures',
			label: 'Pictures',
			icon: 'ph:image-duotone',
			iconFilled: 'ph:image-fill'
		},
		{
			href: '/more',
			label: 'Others',
			icon: 'ph:list',
			iconFilled: 'ph:list-bold'
		}
	];

	function toggleMenu() {
		if (overlayActive) {
			gsap.to(xSVG, {
				duration: 0.5,
				morphSVG: {
					shape: xSVG,
					curveMode: true,
					precision: 4,
					type: 'rotational'
				},
				ease: 'power2.inOut'
			});
			overlayActive = false;
		} else {
			gsap.to(xSVG, {
				duration: 0.5,
				morphSVG: {
					shape: menuSVG,
					curveMode: true,
					precision: 4,
					type: 'rotational'
				},
				ease: 'power2.inOut'
			});
			overlayActive = true;
		}
	}

	onMount(() => {
		gsap.registerPlugin(MorphSVGPlugin);
	});
</script>

<button
	onclick={toggleMenu}
	class="group absolute top-8 right-8 z-50 hard-shadow-sm rounded-md border-2 border-black bg-white p-2 transition-all duration-100 hover:hard-shadow-base active:hard-shadow-md">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="256"
		height="256"
		viewBox="0 0 256 256"
		class="h-6 w-6 text-gray-800 transition-all duration-400 ease-in-out">
		<path
			bind:this={xSVG}
			fill="currentColor"
			d="M228 128a12 12 0 0 1-12 12H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12M40 76h176a12 12 0 0 0 0-24H40a12 12 0 0 0 0 24m176 104H40a12 12 0 0 0 0 24h176a12 12 0 0 0 0-24" />

		<path
			bind:this={menuSVG}
			fill="none"
			d="M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z" />
	</svg>

	<!-- <svg
		xmlns="http://www.w3.org/2000/svg"
		width="256"
		height="256"
		viewBox="0 0 256 256"
		bind:this={menuSVG}
		class="hidden h-6 w-6 text-gray-800 transition-all duration-400 ease-in-out group-hover:rotate-[135deg]"
		><path
			fill="currentColor"
			d="M228 128a12 12 0 0 1-12 12H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12M40 76h176a12 12 0 0 0 0-24H40a12 12 0 0 0 0 24m176 104H40a12 12 0 0 0 0 24h176a12 12 0 0 0 0-24"
		/></svg
	> -->

	<!-- <Icon
		bind:this={xSVG}
		icon="ph:x-bold"
		class="h-6 w-6 text-gray-800 transition-all duration-400 ease-in-out group-hover:rotate-[135deg]"
	/>
	<Icon
		bind:this={menuSVG}
		icon="ph:x-bold"
		class="h-6 w-6 text-gray-800 transition-all duration-400 ease-in-out group-hover:rotate-[135deg]"
	/> -->
</button>

{#if overlayActive}
	<div class="fixed inset-0 z-40 flex flex-col items-end justify-start">
		{#each menuItems as item, i}
			<div
				transition:slide|global={{ duration: 800, easing: quintInOut, axis: 'x', delay: i * 100 }}
				class="flex h-full w-full grow basis-1 items-center justify-center text-6xl lg:text-8xl font-bold tracking-tight underline decoration-gray-500 decoration-6

				{i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'} ">
				<a href={item.href}>{item.label}</a>
			</div>
		{/each}

		<!-- <div
			transition:slide={{ duration: 500, easing: cubicInOut }}
			class="absolute top-0 h-1/2 w-2/3 rounded-b-6xl bg-lime-200 shadow-lg/5"
		></div> -->
	</div>
{/if}
