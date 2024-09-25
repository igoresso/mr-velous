<svelte:options runes={true} />

<script lang="ts">
	import type { Tile } from './index.ts';

	type Props = {
		tile: Tile;
		activeTile: string | false;
	};

	let { tile, activeTile }: Props = $props();

	let isActive = $derived(activeTile === tile.name);

	function getClasses(tile: Tile) {
		const base = 'block p-3.5';
		const interactivity = `${tile.isDisabled ? 'opacity-40' : 'hover:bg-neutral-100 active:bg-neutral-300 dark:hover:bg-neutral-900 dark:active:bg-neutral-700'}`;
		const accessibility = 'outline-none focus:ring-2 ring-ring ring-inset';
		return `${base} ${tile.class} ${isActive ? 'bg-neutral-200 dark:bg-neutral-800 cursor-default' : interactivity} ${accessibility}`;
	}
</script>

{#snippet content(tile: Tile)}
	<tile.icon />
	<span class="sr-only">{tile.name}</span>
{/snippet}

{#if tile.href === undefined}
	<button
		class={getClasses(tile)}
		type="button"
		onclick={tile.onClick}
		disabled={tile.isDisabled || isActive}
	>
		{@render content(tile)}
	</button>
{:else}
	<a class={getClasses(tile)} href={tile.href}>
		{@render content(tile)}
	</a>
{/if}
