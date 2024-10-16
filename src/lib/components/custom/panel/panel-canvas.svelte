<svelte:options runes={true} />

<script lang="ts">
	import { zoom } from 'd3-zoom';
	import { select } from 'd3-selection';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { getPanelState } from './panel-state.svelte';
	import { scaleLinear } from 'd3-scale';
	import Content from './panel-content.svelte';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
		width: number;
		height: number;
	};

	let { view, width, height }: Props = $props();

	const viewerState = getViewerState();
	const panelState = getPanelState();

	let otherViews = $derived(
		viewerState.views.filter((v) => v.axis !== view.axis).sort((a, b) => a.axis - b.axis)
	);

	// Canvas context
	let canvas = $state<HTMLCanvasElement | null>(null);
	let ctx = $derived(canvas ? canvas.getContext('2d') : null);

	// Aspect ratio and image dimensions
	let canvasAspectRatio = $derived(width / height);
	let imageAspectRatio = $derived((view.cols / view.rows) * view.voxelRatio);

	let imageWidth = $derived(
		imageAspectRatio > canvasAspectRatio ? width : height * imageAspectRatio
	);
	let paddingX = $derived((width - imageWidth) / 2);
	let scalingFactorX = $derived(imageWidth / view.cols);

	let imageHeight = $derived(
		imageAspectRatio > canvasAspectRatio ? width / imageAspectRatio : height
	);
	let paddingY = $derived((height - imageHeight) / 2);
	let scalingFactorY = $derived(imageHeight / view.rows);

	// Position and scale
	let xScaleBaseline = $derived(
		scaleLinear()
			.domain([-paddingX, imageWidth + paddingX])
			.range([0, width])
	);
	let xScale = $derived(view.transform.rescaleX(xScaleBaseline));

	let yScaleBaseline = $derived(
		scaleLinear()
			.domain([imageHeight + paddingY, -paddingY])
			.range([0, height])
	);
	let yScale = $derived(view.transform.rescaleY(yScaleBaseline));

	// Mouse interaction
	function handleScroll(event: WheelEvent) {
		if (event.deltaY < 0) {
			viewerState.previousSlice(view.axis);
		} else {
			viewerState.nextSlice(view.axis);
		}
	}

	function handleSliceChange(event: MouseEvent) {
		if (event.button === 0) {
			document.addEventListener('mousemove', handleLMBMove);
			document.addEventListener('mouseup', handleMouseUp);

			const { sliceX, sliceY } = getSliceCoordinates(event);
			viewerState.changeSlice(otherViews[0].axis, sliceX);
			viewerState.changeSlice(otherViews[1].axis, sliceY);
		}

		if (event.button === 1 && event.detail === 2) {
			viewerState.resetBrightnessAndContrast();
		}
	}

	function handleLMBMove(event: MouseEvent) {
		const { sliceX, sliceY } = getSliceCoordinates(event);
		viewerState.changeSlice(otherViews[0].axis, sliceX);
		viewerState.changeSlice(otherViews[1].axis, sliceY);
	}

	function handleRMBMove(event: MouseEvent) {
		const brightnessChange = -event.movementY * 1e-2;
		const contrastChange = event.movementX * 1e-2;

		viewerState.adjustBrightnessAndContrast(brightnessChange, contrastChange);
	}

	function handleContrastChange(event: MouseEvent) {
		if (event.button === 2) {
			document.addEventListener('mousemove', handleRMBMove);
			document.addEventListener('mouseup', handleMouseUp);
		}
	}

	function handleMouseUp() {
		document.removeEventListener('mousemove', handleRMBMove);
		document.removeEventListener('mousemove', handleLMBMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	function getSliceCoordinates(event: MouseEvent) {
		const sliceX = Math.round(xScale.invert(event.offsetX) / scalingFactorX);
		const sliceY = Math.round(yScale.invert(event.offsetY) / scalingFactorY);
		return { sliceX, sliceY };
	}

	const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
		.scaleExtent([0.5, 5])
		.filter((event) => {
			return event.type !== 'dblclick' && event.button !== 1 && event.button !== 2;
		})
		.on('zoom', (event) => {
			viewerState.setTransform(view.axis, event.transform);
		});

	$effect(() => {
		if (!canvas || panelState.activeMode !== 'cursor') return;
	});

	$effect(() => {
		if (!canvas || panelState.activeMode !== 'zoom') return;

		canvas.removeEventListener('wheel', handleScroll);

		select(canvas).call(zoomBehavior);

		return () => {
			if (!canvas) return;
			select(canvas).on('.zoom', null);
		};
	});

	$effect(() => {
		if (!canvas || panelState.activeMode !== 'cursor') return;

		select(canvas).on('.zoom', null);

		canvas.addEventListener('wheel', handleScroll);
		canvas.addEventListener('mousedown', handleSliceChange);
		canvas.addEventListener('mousedown', handleContrastChange);

		return () => {
			if (!canvas) return;
			canvas.removeEventListener('wheel', handleScroll);
			canvas.removeEventListener('mousedown', handleSliceChange);
			canvas.addEventListener('mousedown', handleContrastChange);
		};
	});

	$effect(() => {
		if (!canvas) return;

		canvas.addEventListener('mousedown', handleContrastChange);
		canvas.addEventListener('contextmenu', (e) => e.preventDefault());

		return () => {
			if (!canvas) return;
			canvas.addEventListener('mousedown', handleContrastChange);
			canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
		};
	});
</script>

<canvas
	class="block"
	class:cursor-crosshair={panelState.activeMode === 'cursor'}
	class:cursor-move={panelState.activeMode === 'zoom'}
	bind:this={canvas}
	{width}
	{height}
>
	{#if ctx}
		<Content {ctx} {width} {height} {xScale} {yScale} {imageWidth} {imageHeight} {view} />
	{/if}
</canvas>
