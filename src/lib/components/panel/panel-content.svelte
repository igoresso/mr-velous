<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { getPanelState } from './panel-state.svelte';
	import { sliceDataToImageArray } from '$lib/helpers';
	import type { View, Volume } from '$lib/types';
	import type { ScaleLinear } from 'd3-scale';

	type Props = {
		ctx: CanvasRenderingContext2D;
		width: number;
		height: number;
		xScale: ScaleLinear<number, number>;
		yScale: ScaleLinear<number, number>;
		imageWidth: number;
		imageHeight: number;
		view: View;
	};

	let { ctx, width, height, xScale, yScale, imageWidth, imageHeight, view }: Props = $props();

	const viewerState = getViewerState();
	const panelState = getPanelState();

	let otherViews = $derived(
		viewerState.views.filter((v) => v.axis !== view.axis).sort((a, b) => a.axis - b.axis)
	);

	let scalingFactorX = $derived(imageWidth / view.cols);
	let scalingFactorY = $derived(imageHeight / view.rows);

	function createImageData(volume: Volume): ImageData {
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
	}

	// Off-screen canvas for drawing images
	let offscreenCanvas = document.createElement('canvas');
	let offscreenCtx = offscreenCanvas.getContext('2d');

	$effect(() => {
		if (!offscreenCtx) return;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw images
		ctx.save();
		ctx.translate(xScale(0), yScale(0));
		ctx.scale(view.transform.k, view.transform.k);
		ctx.scale(1, -1);
		ctx.imageSmoothingEnabled = false;

		offscreenCanvas.width = view.cols;
		offscreenCanvas.height = view.rows;

		for (let i = viewerState.volumes.length - 1; i >= 0; i--) {
			if (!viewerState.volumes[i].isVisible) continue;

			const imageData = createImageData(viewerState.volumes[i]);
			offscreenCtx.putImageData(imageData, 0, 0);
			ctx.drawImage(offscreenCanvas, 0, 0, imageWidth, imageHeight);
		}

		ctx.restore();

		if (panelState.crosshair) {
			// Horizontal line
			ctx.beginPath();
			ctx.moveTo(xScale((otherViews[0].currentSlice + 0.5) * scalingFactorX), yScale.range()[0]);
			ctx.lineTo(xScale((otherViews[0].currentSlice + 0.5) * scalingFactorX), yScale.range()[1]);
			ctx.strokeStyle = otherViews[0].color;
			ctx.stroke();

			// Vertical line
			ctx.beginPath();
			ctx.moveTo(xScale.range()[0], yScale((otherViews[1].currentSlice + 0.5) * scalingFactorY));
			ctx.lineTo(xScale.range()[1], yScale((otherViews[1].currentSlice + 0.5) * scalingFactorY));
			ctx.strokeStyle = otherViews[1].color;
			ctx.stroke();
		}
	});
</script>
