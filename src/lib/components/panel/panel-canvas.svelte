<svelte:options runes={true} />

<script lang="ts">
	import { extractSliceFromVolume, sliceDataToImageData } from '$lib/helpers';
	import { select } from 'd3-selection';
	import { scaleLinear } from 'd3-scale';
	import { zoom, zoomIdentity } from 'd3-zoom';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
		width: number;
		height: number;
	};

	let { view, width, height }: Props = $props();

	let canvas: HTMLCanvasElement;

	let transform = $state(zoomIdentity);

	// Aspect ratio and image dimensions
	const canvasAspectRatio = $derived(width / height);
	const imageAspectRatio = $derived((view.cols / view.rows) * view.voxelRatio);

	const imageWidth = $derived(
		imageAspectRatio > canvasAspectRatio ? width : height * imageAspectRatio
	);
	const paddingX = $derived((width - imageWidth) / 2);

	const imageHeight = $derived(
		imageAspectRatio > canvasAspectRatio ? width / imageAspectRatio : height
	);
	const paddingY = $derived((height - imageHeight) / 2);

	// Position and scale
	const xScaleBaseline = $derived(
		scaleLinear()
			.domain([-paddingX, imageWidth + paddingX])
			.range([0, width])
	);
	const xScale = $derived(transform.rescaleX(xScaleBaseline));

	const yScaleBaseline = $derived(
		scaleLinear()
			.domain([imageHeight + paddingY, -paddingY])
			.range([0, height])
	);
	const yScale = $derived(transform.rescaleY(yScaleBaseline));

	// Image data
	const imageData: ImageData = $derived.by(() => {
		const sliceData = extractSliceFromVolume(view.header, view.data, view.axis, view.slice);
		return sliceDataToImageData(sliceData, view.rows, view.cols, view.min, view.max);
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
		.on('zoom', (event) => {
			transform = event.transform;
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
			ctx.scale(transform.k, transform.k);
			ctx.scale(1, -1);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(offscreenCanvas, 0, 0, imageWidth, imageHeight);

			ctx.restore();
		}
	});
</script>

<canvas bind:this={canvas} {width} {height}></canvas>
