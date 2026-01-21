<script>
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { fly, slide } from 'svelte/transition';
	import { backInOut, cubicInOut, quintInOut } from 'svelte/easing';

	const navItems = [
		{
			href: '/',
			label: 'Home',
			icon: 'ph:house-duotone',
			iconFilled: 'ph:house-fill'
		}
		// {
		// 	href: '/places',
		// 	label: 'Places',
		// 	icon: 'ph:map-pin-duotone',
		// 	iconFilled: 'ph:map-pin-fill'
		// },
		// {
		// 	href: '/pictures',
		// 	label: 'Pictures',
		// 	icon: 'ph:image-duotone',
		// 	iconFilled: 'ph:image-fill'
		// },
		// {
		// 	href: '/more',
		// 	label: 'Others',
		// 	icon: 'ph:list',
		// 	iconFilled: 'ph:list-bold'
		// }
	];

	let activeHref = $derived($page.url.pathname);
	let overlayActive = $state(false);
</script>

{#if overlayActive}
	<div class="fixed inset-0 z-40 flex flex-col items-start justify-start">
		{#each Array(8) as rect, i}
			<div
				transition:slide|global={{ duration: 800, easing: quintInOut, axis: 'x', delay: i * 100 }}
				class="h-full w-full grow basis-1 {i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'} "
			></div>
		{/each}

		<!-- <div
			transition:slide={{ duration: 500, easing: cubicInOut, axis: 'x', delay: 100 }}
			class="h-full w-full grow basis-1 bg-lime-200"
		></div>
		<div
			transition:slide={{ duration: 500, easing: cubicInOut, axis: 'x', delay: 200 }}
			class="h-full w-full grow basis-1 bg-green-200"
		></div>
		<div
			transition:slide={{ duration: 500, easing: cubicInOut, axis: 'x', delay: 300 }}
			class="h-full w-full grow basis-1 bg-lime-200"
		></div>
		<div
			transition:slide={{ duration: 500, easing: cubicInOut, axis: 'x', delay: 400 }}
			class="h-full w-full grow basis-1 bg-green-200"
		></div> -->

		<!-- <div
			transition:slide={{ duration: 500, easing: cubicInOut }}
			class="rounded-b-6xl absolute top-0 h-1/2 w-2/3 bg-lime-200 shadow-lg/5"
		></div> -->
	</div>
{/if}

<!-- <nav class="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white"> -->
<nav
	class="fixed inset-x-0 bottom-0 z-50 mx-2 my-2 rounded-2xl border border-gray-200 bg-white/80 shadow-2xl/5 backdrop-blur-md"
>
	<div class="mx-auto flex h-16 max-w-md">
		{#each navItems as item}
			<a href={item.href} class="flex flex-1 flex-col items-center justify-center text-center">
				<Icon
					icon={activeHref === item.href ? item.iconFilled : item.icon}
					class="h-6 w-6 {activeHref === item.href ? 'text-black' : 'text-gray-600'}"
				/>
				<!-- <span class="text-xs">{item.label}</span> -->
			</a>
		{/each}
		<button
			onclick={() => (overlayActive = !overlayActive)}
			class="flex flex-1 flex-col items-center justify-center text-center"
		>
			<Icon icon="ph:plus-circle-duotone" class="h-6 w-6 text-sky-800" />
			<!-- <span class="text-xs">{item.label}</span> -->
		</button>
	</div>
</nav>

<!-- <div class="h-10 inset-x-0 fixed bottom-0 bg-white"></div> -->

<div class="h-16"></div>
