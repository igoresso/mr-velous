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

	let canvas: HTMLCanvasElement;

	function handleScroll(event: WheelEvent) {
		if (event.deltaY < 0) {
			viewerState.previousSlice(view.axis);
		} else {
			viewerState.nextSlice(view.axis);
		}
	}

	function handleMouseClick(event: MouseEvent) {
		console.log(event.button);
		if (event.button === 2) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		if (event.button === 1 && event.detail === 2) {
			console.log('reset');
			viewerState.resetBrightnessAndContrast();
		}
	}

	function handleMouseMove(event: MouseEvent) {
		const brightnessChange = -event.movementY * 1e-2;
		const contrastChange = event.movementX * 1e-2;

		viewerState.adjustBrightnessAndContrast(brightnessChange, contrastChange);
	}

	function handleMouseUp() {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}
</script>

<div class={`flex flex-col rounded-xl border-2 border-neutral-800 dark:border-neutral-800`}>
	<!-- <div class="z-10 mb-2 h-10"></div> -->
	<div
		class="grow"
		bind:clientWidth={width}
		bind:clientHeight={height}
		onwheel={handleScroll}
		onmousedown={handleMouseClick}
		oncontextmenu={(e) => e.preventDefault()}
		role="presentation"
	>
		<Canvas {view} {width} {height} {canvas} />
	</div>
</div>
