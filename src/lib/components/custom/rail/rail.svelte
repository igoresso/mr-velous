<script lang="ts">
	import Tile from './rail-tile.svelte';
	import type { Tile as TileType } from './index.ts';

	// Props for the rail
	type Props = {
		tiles: TileType[];
		activeTile: string | null;
	};

	let { tiles, activeTile }: Props = $props();
</script>

<nav class="h-full border-r-2">
	<ul class="flex h-full flex-col">
		{#each tiles as tile, i (i)}
			<li class="tile {tile.class}">
				<Tile {tile} {activeTile} />
			</li>
		{/each}
	</ul>
</nav>
