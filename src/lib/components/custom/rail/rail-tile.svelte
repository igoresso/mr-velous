<script lang="ts">
	import { Button } from 'bits-ui';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { Tile } from './index.ts';
	import { cn } from '$lib/utils.js';

	type Props = {
		tile: Tile;
		activeTile: string | null;
	};

	let { tile, activeTile }: Props = $props();

	let isActive = $derived(activeTile === tile.name);

	function getClasses(tile: Tile) {
		const base = 'block p-3.5 transition-colors outline-none focus:ring-1 ring-ring ring-inset';
		const interactivity = tile.isDisabled
			? 'opacity-40 cursor-default'
			: 'hover:bg-neutral-100 active:bg-neutral-300 dark:hover:bg-neutral-900 dark:active:bg-neutral-700';
		const activeState = isActive
			? 'bg-neutral-200 dark:bg-neutral-800 cursor-default'
			: interactivity;
		return `${base} ${tile.class} ${activeState}`;
	}
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button.Root
				{...props}
				class={cn(getClasses(tile))}
				href={tile.href}
				onclick={tile.onClick}
				disabled={tile.isDisabled || isActive}
			>
				<tile.icon />
				<span class="sr-only">{tile.name}</span>
			</Button.Root>
		{/snippet}
	</Tooltip.Trigger>
	{#if !tile.isDisabled && !isActive}
		<Tooltip.Content side="right">
			{tile.name}
		</Tooltip.Content>
	{/if}
</Tooltip.Root>
