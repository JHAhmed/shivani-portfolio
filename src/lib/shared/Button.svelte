<script>
	import { Button } from 'bits-ui';
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';

	let {
		text = 'Button',
		href,
		icon,
		onclick,
		variant = 'default',
		arrow = true,
		...props
	} = $props();

	const baseClasses = `
        group inline-flex h-12 cursor-pointer items-center justify-center rounded-lg px-5 
        text-lg font-semibold shadow-lg/10 active:scale-[0.99] active:transition-all`;

	const variantClasses = {
		default: 'bg-gray-800 text-white hover:bg-gray-800/95',
		destructive: 'bg-red-500 text-white hover:bg-red-600/90',
		outline: 'border border-gray-400 hover:bg-gray-200/50 text-black',
		translucent: 'bg-white/30 text-gray-800 hover:bg-white/40 backdrop-blur-md'
	};

	let finalClasses = $derived(cn(baseClasses, variantClasses[variant], props.class));
</script>

<Button.Root {onclick} {href} class={finalClasses}>
	{#if icon}
		<Icon {icon} class="h-6 w-6" />
	{/if}

	<span class="mx-3">
		{text}
	</span>

	{#if arrow}
		<Icon icon="ph:caret-right-bold" class="h-6 w-6" />
	{/if}
</Button.Root>
