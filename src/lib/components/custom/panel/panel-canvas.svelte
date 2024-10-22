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

	let otherViews = $derived.by(() => {
		const [viewX, viewY] = viewerState.views
			.filter((v) => v.axis !== view.axis)
			.sort((a, b) => a.axis - b.axis);

		return view.transpose ? [viewY, viewX] : [viewX, viewY];
	});

	// Canvas context
	let canvas = $state<HTMLCanvasElement | null>(null);
	let ctx = $derived(canvas ? canvas.getContext('2d') : null);

	// Image dimensions
	let imageCols = view.transpose ? view.rows : view.cols;
	let imageRows = view.transpose ? view.cols : view.rows;
	let voxelRatio = view.transpose ? 1 / view.voxelRatio : view.voxelRatio;

	let imageAspectRatio = $derived((imageCols / imageRows) * voxelRatio);
	let canvasAspectRatio = $derived(width / height);

	let imageWidth = $derived(
		imageAspectRatio > canvasAspectRatio ? width : height * imageAspectRatio
	);
	let paddingX = $derived((width - imageWidth) / 2);
	let scalingFactorX = $derived(imageWidth / imageCols);

	let imageHeight = $derived(
		imageAspectRatio > canvasAspectRatio ? width / imageAspectRatio : height
	);
	let paddingY = $derived((height - imageHeight) / 2);
	let scalingFactorY = $derived(imageHeight / imageRows);

	// Position and scale
	let xScaleBaseline = $derived(
		scaleLinear()
			.domain(view.flipX ? [imageWidth + paddingX, -paddingX] : [-paddingX, imageWidth + paddingX])
			.range([0, width])
	);
	let xScale = $derived(view.transform.rescaleX(xScaleBaseline));

	let yScaleBaseline = $derived(
		scaleLinear()
			.domain(
				view.flipY ? [imageHeight + paddingY, -paddingY] : [-paddingY, imageHeight + paddingY]
			)
			.range([0, height])
	);
	let yScale = $derived(view.transform.rescaleY(yScaleBaseline));

	// Mouse interaction
	function handleScroll(event: WheelEvent) {
		if (event.deltaY < 0) {
			viewerState.nextSlice(view.axis);
		} else {
			viewerState.previousSlice(view.axis);
		}
	}

	function handleSliceChange(event: MouseEvent) {
		if (event.button === 0) {
			document.addEventListener('mousemove', handleLMBMove);
			document.addEventListener('mouseup', handleMouseUp);

			const { sliceX, sliceY } = getSliceCoordinates(event.offsetX, event.offsetY);
			viewerState.changeSlice(otherViews[0].axis, sliceX);
			viewerState.changeSlice(otherViews[1].axis, sliceY);
		}
	}

	function handleLMBMove(event: MouseEvent) {
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		let offsetX = event.clientX - rect.left;
		let offsetY = event.clientY - rect.top;

		offsetX = Math.max(0, Math.min(offsetX, rect.width));
		offsetY = Math.max(0, Math.min(offsetY, rect.height));

		const { sliceX, sliceY } = getSliceCoordinates(offsetX, offsetY);

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

	function resetBrightnessAndContrast(event: MouseEvent) {
		if (event.button === 1 && event.detail === 2) {
			viewerState.resetBrightnessAndContrast();
		}
	}

	function handleMouseUp() {
		document.removeEventListener('mousemove', handleRMBMove);
		document.removeEventListener('mousemove', handleLMBMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	// Touch events
	function handleTouchStart(event: TouchEvent) {
		if (!canvas) return;

		event.preventDefault();

		const touch = event.touches[0];

		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd);

		const rect = canvas.getBoundingClientRect();
		let offsetX = touch.clientX - rect.left;
		let offsetY = touch.clientY - rect.top;

		offsetX = Math.max(0, Math.min(offsetX, rect.width));
		offsetY = Math.max(0, Math.min(offsetY, rect.height));

		const { sliceX, sliceY } = getSliceCoordinates(offsetX, offsetY);

		viewerState.changeSlice(otherViews[0].axis, sliceX);
		viewerState.changeSlice(otherViews[1].axis, sliceY);
	}

	function handleTouchMove(event: TouchEvent) {
		event.preventDefault();

		if (!canvas) return;
		const touch = event.touches[0];

		const rect = canvas.getBoundingClientRect();
		let offsetX = touch.clientX - rect.left;
		let offsetY = touch.clientY - rect.top;

		offsetX = Math.max(0, Math.min(offsetX, rect.width));
		offsetY = Math.max(0, Math.min(offsetY, rect.height));

		const { sliceX, sliceY } = getSliceCoordinates(offsetX, offsetY);

		viewerState.changeSlice(otherViews[0].axis, sliceX);
		viewerState.changeSlice(otherViews[1].axis, sliceY);
	}

	function handleTouchEnd() {
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleTouchEnd);
	}

	function getSliceCoordinates(posX: number, posY: number) {
		const sliceX = Math.floor(xScale.invert(posX) / scalingFactorX);
		const sliceY = Math.floor(yScale.invert(posY) / scalingFactorY);

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
		if (!canvas) return;

		canvas.addEventListener('mousedown', handleContrastChange);
		canvas.addEventListener('mousedown', resetBrightnessAndContrast);

		if (panelState.activeMode === 'cursor') {
			select(canvas).on('.zoom', null);

			canvas.addEventListener('wheel', handleScroll);
			canvas.addEventListener('mousedown', handleSliceChange);
			canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
		} else if (panelState.activeMode === 'zoom') {
			canvas.removeEventListener('wheel', handleScroll);
			canvas.removeEventListener('mousedown', handleSliceChange);
			canvas.removeEventListener('touchstart', handleTouchStart);

			select(canvas).call(zoomBehavior);
		}

		canvas.addEventListener('contextmenu', (e) => e.preventDefault());

		return () => {
			if (!canvas) return;

			canvas.removeEventListener('wheel', handleScroll);
			canvas.removeEventListener('mousedown', handleSliceChange);
			canvas.removeEventListener('mousedown', handleContrastChange);
			canvas.removeEventListener('mousedown', resetBrightnessAndContrast);
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('contextmenu', (e) => e.preventDefault());

			select(canvas).on('.zoom', null);
		};
	});
</script>

<canvas
	class="block touch-none"
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
