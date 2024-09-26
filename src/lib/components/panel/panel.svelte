<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { setPanelState } from './panel-state.svelte';
	import Canvas from './panel-canvas.svelte';
	import Controls from './panel-controls.svelte';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
	};

	let { view }: Props = $props();

	setPanelState();

	let width = $state(0);
	let height = $state(0);
</script>

<div
	class={`flex flex-col overflow-clip rounded-xl border-2 border-neutral-800 dark:border-neutral-800`}
>
	<div class="flex justify-end space-x-2 px-4 py-2">
		<Controls {view} />
	</div>
	<div class="grow bg-black" bind:clientWidth={width} bind:clientHeight={height}>
		<Canvas {view} {width} {height} />
	</div>
</div>
