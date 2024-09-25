<svelte:options runes={true} />

<script lang="ts">
	import { zoom } from 'd3-zoom';
	import { select } from 'd3-selection';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import Canvas from './panel-canvas.svelte';
	import Controls from './panel-controls.svelte';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
	};

	let { view }: Props = $props();

	const viewerState = getViewerState();

	let width = $state(0);
	let height = $state(0);
	let canvas = $state<HTMLCanvasElement | null>(null);
	let activeMode = $state<'cursor' | 'zoom'>('cursor');
	let cursorClass = $derived(activeMode === 'cursor' ? 'cursor-crosshair' : 'cursor-move');

	// Mouse interaction
	function handleScroll(event: WheelEvent) {
		if (event.deltaY < 0) {
			viewerState.previousSlice(view.axis);
		} else {
			viewerState.nextSlice(view.axis);
		}
	}

	function handleMouseClick(event: MouseEvent) {
		if (event.button === 2) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		if (event.button === 1 && event.detail === 2) {
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

	const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
		.scaleExtent([0.5, 4])
		.filter((event) => {
			return event.type !== 'dblclick' && event.button !== 1 && event.button !== 2;
		})
		.on('zoom', (event) => {
			viewerState.setTransform(view.axis, event.transform);
		});

	$effect(() => {
		if (!canvas) return;

		canvas.addEventListener('mousedown', handleMouseClick);
		canvas.addEventListener('contextmenu', (e) => e.preventDefault());

		return () => {
			if (!canvas) return;
			canvas.removeEventListener('mousedown', handleMouseClick);
		};
	});

	$effect(() => {
		if (!canvas || activeMode !== 'zoom') return;

		canvas.removeEventListener('wheel', handleScroll);

		select(canvas).call(zoomBehavior);

		return () => {
			select(canvas).on('.zoom', null);
		};
	});

	// Cursor interaction
	$effect(() => {
		if (!canvas || activeMode !== 'cursor') return;

		select(canvas).on('.zoom', null);

		canvas.addEventListener('wheel', handleScroll);

		return () => {
			if (!canvas) return;
			canvas.removeEventListener('wheel', handleScroll);
		};
	});
</script>

<div
	class={`flex flex-col overflow-clip rounded-xl border-2 border-neutral-800 dark:border-neutral-800`}
>
	<div class="flex justify-end space-x-1 px-4 py-2">
		<Controls
			{activeMode}
			on:modechange={({ detail }) => (activeMode = detail.mode)}
			on:resetview={() => viewerState.resetTransform(view.axis)}
		/>
	</div>
	<div class={`grow ${cursorClass}`} bind:clientWidth={width} bind:clientHeight={height}>
		<Canvas {view} {width} {height} bind:canvas />
	</div>
</div>
