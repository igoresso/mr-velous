<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { sliceDataToImageArray } from '$lib/helpers';
	import { select } from 'd3-selection';
	import { scaleLinear } from 'd3-scale';
	import { zoom } from 'd3-zoom';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
		width: number;
		height: number;
		canvas: HTMLCanvasElement;
	};

	let { view, width, height, canvas }: Props = $props();

	let viewerState = getViewerState();

	let volume = $derived(viewerState.volumes[0]);

	// Aspect ratio and image dimensions
	let canvasAspectRatio = $derived(width / height);
	let imageAspectRatio = $derived((view.cols / view.rows) * view.voxelRatio);

	let imageWidth = $derived(
		imageAspectRatio > canvasAspectRatio ? width : height * imageAspectRatio
	);
	let paddingX = $derived((width - imageWidth) / 2);

	let imageHeight = $derived(
		imageAspectRatio > canvasAspectRatio ? width / imageAspectRatio : height
	);
	let paddingY = $derived((height - imageHeight) / 2);

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

	// Image data
	let imageData: ImageData = $derived.by(() => {
		const sliceData = viewerState.getSliceDataForView(view.axis, volume.id);

		const imageArray = sliceDataToImageArray(
			sliceData,
			view.rows,
			view.cols,
			volume.min,
			volume.max,
			volume.brightnessFactor,
			volume.contrastFactor,
			volume.opacity
		);
		return new ImageData(imageArray, view.cols, view.rows);
	});

	// Off-screen canvas for drawing the image
	let offscreenCanvas = document.createElement('canvas');
	let offscreenCtx = offscreenCanvas.getContext('2d');

	// Set up the zoom behavior
	const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
		.extent([
			[0, 0],
			[width, height]
		])
		.scaleExtent([1, 1])
		.filter((event) => {
			return event.type !== 'dblclick' && event.button !== 1 && event.button !== 2;
		})
		.on('zoom', (event) => {
			viewerState.setTransform(view.axis, event.transform);
		});

	// Apply the zoom behavior to the canvas element
	$effect(() => {
		select(canvas).call(zoomBehavior);
		return () => {
			select(canvas).on('.zoom', null);
		};
	});

	$effect(() => {
		if (!offscreenCanvas || !offscreenCtx) return;

		offscreenCanvas.width = view.cols;
		offscreenCanvas.height = view.rows;

		offscreenCtx.putImageData(imageData, 0, 0);

		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();

			ctx.translate(xScale(0), yScale(0));
			ctx.scale(view.transform.k, view.transform.k);
			ctx.scale(1, -1);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(offscreenCanvas, 0, 0, imageWidth, imageHeight);

			ctx.restore();
		}
	});
	$inspect(imageData);
</script>

<canvas bind:this={canvas} {width} {height}></canvas>
