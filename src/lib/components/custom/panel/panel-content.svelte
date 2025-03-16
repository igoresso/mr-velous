<script lang="ts">
	import { getViewerState } from '$lib/context/viewer.svelte';
	import { getPanelState } from './panel-state.svelte';
	import { sliceDataToImageArray } from '$lib/helpers';
	import type { ScaleLinear } from 'd3-scale';
	import type { View, Volume } from '$lib/types';

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

	let otherViews = $derived.by(() => {
		const [viewX, viewY] = viewerState.views
			.filter((v) => v.axis !== view.axis)
			.sort((a, b) => a.axis - b.axis);

		return view.transpose ? [viewY, viewX] : [viewX, viewY];
	});

	let scalingFactorX = $derived(view.transpose ? imageWidth / view.rows : imageWidth / view.cols);
	let scalingFactorY = $derived(view.transpose ? imageHeight / view.cols : imageHeight / view.rows);

	// Off-screen canvas for drawing images
	const offscreenCanvas = document.createElement('canvas');
	const offscreenCtx = offscreenCanvas.getContext('2d');

	function createImageData(volume: Volume): ImageData {
		const sliceData = viewerState.getSliceDataForView(view.axis, volume.id);

		if (!sliceData) return new ImageData(view.cols, view.rows);

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

	function drawCrosshairs() {
		const [viewX, viewY] = otherViews;

		const crosshairX = (viewX.currentSlice + 0.5) * scalingFactorX;
		const crosshairY = (viewY.currentSlice + 0.5) * scalingFactorY;

		// Horizontal line
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.moveTo(xScale(crosshairX), yScale.range()[0]);
		ctx.lineTo(xScale(crosshairX), yScale.range()[1]);
		ctx.strokeStyle = viewX.color;
		ctx.stroke();

		// Vertical line
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.moveTo(xScale.range()[0], yScale(crosshairY));
		ctx.lineTo(xScale.range()[1], yScale(crosshairY));
		ctx.strokeStyle = viewY.color;
		ctx.stroke();
	}

	function drawDirections() {
		const offset = 7.5;
		const top = view.plane === 'AXIAL' ? 'A' : 'S';
		const bottom = view.plane === 'AXIAL' ? 'P' : 'I';
		const left = view.plane === 'SAGITTAL' ? 'A' : 'R';
		const right = view.plane === 'SAGITTAL' ? 'P' : 'L';

		ctx.save();

		ctx.font = '1rem sans-serif';
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'black';
		ctx.shadowColor = 'black';
		ctx.shadowBlur = 5;
		ctx.globalAlpha = 0.75;
		ctx.lineWidth = 2;

		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.strokeText(top, width / 2, offset);
		ctx.fillText(top, width / 2, offset);

		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.shadowBlur = 5;
		ctx.strokeText(bottom, width / 2, height - offset);
		ctx.fillText(bottom, width / 2, height - offset);

		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.strokeText(left, offset, height / 2);
		ctx.fillText(left, offset, height / 2);

		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		ctx.strokeText(right, width - offset, height / 2);
		ctx.fillText(right, width - offset, height / 2);

		ctx.restore();
	}

	$effect(() => {
		if (!ctx || !offscreenCtx) return;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw images
		ctx.save();
		ctx.translate(xScale(0), yScale(0));
		ctx.scale(view.transform.k, view.transform.k);
		ctx.scale(view.flipX ? -1 : 1, view.flipY ? -1 : 1);
		if (view.transpose) {
			ctx.scale(-1, 1);
			ctx.rotate(Math.PI / 2);
		}

		ctx.imageSmoothingEnabled = false;

		offscreenCanvas.width = view.cols;
		offscreenCanvas.height = view.rows;

		for (let i = viewerState.volumes.length - 1; i >= 0; i--) {
			if (!viewerState.volumes[i].isVisible) continue;

			const imageData = createImageData(viewerState.volumes[i]);
			offscreenCtx.putImageData(imageData, 0, 0);

			if (view.transpose) {
				ctx.drawImage(offscreenCanvas, 0, 0, imageHeight, imageWidth);
			} else {
				ctx.drawImage(offscreenCanvas, 0, 0, imageWidth, imageHeight);
			}
		}

		ctx.restore();

		if (panelState.crosshair) {
			drawCrosshairs();
		}

		if (panelState.directions) {
			drawDirections();
		}
	});
</script>
