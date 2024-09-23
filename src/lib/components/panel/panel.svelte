<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import Canvas from './panel-canvas.svelte';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
	};

	let { view }: Props = $props();

	const viewerState = getViewerState();

	let width = $state(0);
	let height = $state(0);

	function handleScroll(event: WheelEvent) {
		if (event.deltaY < 0) {
			viewerState.previousSlice(view.id);
		} else {
			viewerState.nextSlice(view.id);
		}
	}
</script>

<div
	class={`flex flex-col rounded-xl border-2 border-neutral-800 bg-black dark:border-neutral-800`}
>
	<!-- <div class="z-10 mb-2 h-10"></div> -->
	<div class="flex grow flex-col">
		<div class="grow" bind:clientWidth={width} bind:clientHeight={height} onwheel={handleScroll}>
			<Canvas {view} {width} {height} />
		</div>
	</div>
</div>
