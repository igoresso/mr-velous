<script lang="ts">
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	class={cn(
		'border-input ring-offset-background data-[placeholder]:text-muted-foreground focus:ring-ring-3 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronsUpDown class="size-4 opacity-50" />
</SelectPrimitive.Trigger>
