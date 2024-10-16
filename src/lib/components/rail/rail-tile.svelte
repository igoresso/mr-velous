<svelte:options runes={true} />

<script lang="ts">
	import { Button } from 'bits-ui';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { Tile } from './index.ts';

	type Props = {
		tile: Tile;
		activeTile: string | null;
	};

	let { tile, activeTile }: Props = $props();

	let isActive = $derived(activeTile === tile.name);

	function getClasses(tile: Tile) {
		const base = 'block p-3.5 transition-colors outline-none focus:ring-2 ring-ring ring-inset';
		const interactivity = tile.isDisabled
			? 'opacity-40'
			: 'hover:bg-neutral-100 active:bg-neutral-300 dark:hover:bg-neutral-900 dark:active:bg-neutral-700';
		const activeState = isActive
			? 'bg-neutral-200 dark:bg-neutral-800 cursor-default'
			: interactivity;
		return `${base} ${tile.class} ${activeState}`;
	}
</script>

<Tooltip.Root>
	<Tooltip.Trigger asChild let:builder>
		<Button.Root
			builders={[builder]}
			class={getClasses(tile)}
			disabled={tile.isDisabled}
			href={tile.href}
			onclick={tile.onClick}
		>
			<tile.icon />
			<span class="sr-only">{tile.name}</span>
		</Button.Root>
	</Tooltip.Trigger>
	{#if !tile.isDisabled && !isActive}
		<Tooltip.Content side="right">
			{tile.name}
		</Tooltip.Content>
	{/if}
</Tooltip.Root>
