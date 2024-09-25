<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { sliceDataToImageArray } from '$lib/helpers';
	import { scaleLinear } from 'd3-scale';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
		width: number;
		height: number;
		canvas: HTMLCanvasElement | null;
	};

	let { view, width, height, canvas = $bindable() }: Props = $props();

	let viewerState = getViewerState();

	let volume = $derived(viewerState.volumes[0]);
	let currentSlices = $derived(viewerState.views.map((view) => view.currentSlice));
	let otherCurrentSlices = $derived(currentSlices.filter((_, i) => i !== view.axis - 1));

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

	$effect(() => {
		if (!canvas || !offscreenCtx) return;

		offscreenCanvas.width = view.cols;
		offscreenCanvas.height = view.rows;

		offscreenCtx.putImageData(imageData, 0, 0);

		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.save();

			ctx.translate(xScale(0), yScale(0));
			ctx.scale(view.transform.k, view.transform.k);
			ctx.scale(1, -1);
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(offscreenCanvas, 0, 0, imageWidth, imageHeight);

			ctx.restore();

			// Draw vertical and horizontal lines for other views
			ctx.beginPath();
			ctx.moveTo(xScale(otherCurrentSlices[0] * scalingFactorX), 0);
			ctx.lineTo(xScale(otherCurrentSlices[0] * scalingFactorX), height);
			ctx.strokeStyle = 'red';
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, yScale(otherCurrentSlices[1] * scalingFactorY));
			ctx.lineTo(width, yScale(otherCurrentSlices[1] * scalingFactorY));
			ctx.strokeStyle = 'yellow';
			ctx.stroke();
		}
	});

	$inspect(imageWidth / view.cols, imageHeight / view.rows);
</script>

<canvas bind:this={canvas} {width} {height}></canvas>
