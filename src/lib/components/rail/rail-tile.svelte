<svelte:options runes={true} />

<script lang="ts">
	import type { Tile } from './index.ts';

	type Props = {
		tile: Tile;
		activeTile: string;
	};

	let { tile, activeTile }: Props = $props();

	function getClasses(tile: Tile) {
		let isActive = activeTile === tile.name;
		let classesInteractivity = `${tile.isDisabled ? 'text-neutral-400' : 'hover:bg-neutral-100 active:bg-neutral-300 dark:hover:bg-neutral-900 dark:active:bg-neutral-700'}`;
		return `${tile.class} block p-3.5 ${isActive ? 'bg-neutral-200 dark:bg-neutral-800 cursor-default' : classesInteractivity}`;
	}
</script>

{#snippet content(tile: Tile)}
	<tile.icon />
	<span class="sr-only">{tile.name}</span>
{/snippet}

{#if tile.href === undefined}
	<button class={getClasses(tile)} type="button" onclick={tile.onClick} disabled={tile.isDisabled}>
		{@render content(tile)}
	</button>
{:else}
	<a class={getClasses(tile)} href={tile.href}>
		{@render content(tile)}
	</a>
{/if}
