<script>
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { fly, scale, slide } from 'svelte/transition';
	import { backInOut, bounceInOut, cubicInOut, quintInOut } from 'svelte/easing';

	const navItems = $state([
		{
			href: '/',
			label: 'Home',
			hover: false,
			icon: 'ph:house-duotone',
			iconFilled: 'ph:house-fill'
		}
	]);

	let activeHref = $derived($page.url.pathname);
</script>

<!-- <nav class="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white"> -->
<nav class="mx-auto mt-6 flex w-fit items-center justify-center rounded-full bg-white px-8">
	<div class="mx-auto flex h-16 max-w-md">
		{#each navItems as item}
			<a
				onmouseenter={() => (item.hover = true)}
				onmouseleave={() => (item.hover = false)}
				href={item.href}
				class="group/link relative flex h-fit flex-1 flex-col items-center justify-center text-center"
			>
				<!-- <Icon
					icon={activeHref === item.href ? item.iconFilled : item.icon}
					class="h-6 w-6 {activeHref === item.href ? 'text-black' : 'text-gray-600'}"
				/> -->

				<span class="z-10">{item.label}</span>

				{#if item.hover}
					<span
						transition:scale|local={{ y: 4, duration: 400, easing: backInOut }}
						class="absolute -top-1 -left-5 z-5 flex -rotate-2 border-2 border-black bg-green-400 px-10 py-4 transition-all duration-200 group-hover/link:hard-shadow-base group-active/link:hard-shadow-md"
					></span>
				{/if}
				<!-- <span class="group/link relative inline-flex w-12 text-sm">
					
				</span> -->
			</a>
		{/each}
	</div>
</nav>

<!-- <div class="h-10 inset-x-0 fixed bottom-0 bg-white"></div> -->

<!-- <div class="h-16"></div> -->
