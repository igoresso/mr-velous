import { getContext, setContext } from 'svelte';
import { zoomIdentity } from 'd3-zoom';
import { computeMinAndMax, extractSliceFromVolume } from '$lib/helpers';
import type { ZoomTransform } from 'd3-zoom';
import type { TypedArray, Dataset, View, Volume } from '$lib/types';

enum Axis {
	X = 1,
	Y = 2,
	Z = 3
}

export class ViewerState {
	volumes = $state<Volume[]>([]);
	views = $state<View[]>([]);
	activeTile = $state<string>('Information');

	addVolume(fileName: string, dataset: Dataset): void {
		const { min, max } = computeMinAndMax(dataset.data);

		this.volumes.forEach((volume) => {
			volume.isActive = false;
		});

		const newVolume: Volume = {
			id: crypto.randomUUID(),
			fileName: fileName,
			...dataset,
			min,
			max,
			brightnessFactor: 0,
			contrastFactor: 1,
			opacity: 1,
			isActive: true,
			isVisible: true
		};

		this.volumes.push(newVolume);

		if (this.volumes.length === 1) {
			this.initViews(newVolume);
		}
	}

	private initViews(volume: Volume): void {
		const { dims, pixDims } = volume.header;

		const axisColors = {
			[Axis.X]: '#f87171',
			[Axis.Y]: '#4ade80',
			[Axis.Z]: '#60a5fa'
		};

		this.views = [Axis.X, Axis.Y, Axis.Z].map((axis) => {
			const currentSlice = Math.floor(dims[axis] / 2) - 1;
			const rows = axis === Axis.X ? dims[3] : axis === Axis.Y ? dims[3] : dims[2];
			const cols = axis === Axis.X ? dims[2] : axis === Axis.Y ? dims[1] : dims[1];
			const voxelRatio =
				axis === Axis.X
					? pixDims[2] / pixDims[3]
					: axis === Axis.Y
						? pixDims[1] / pixDims[3]
						: pixDims[1] / pixDims[2];

			return {
				axis,
				currentSlice,
				slices: dims[axis] - 1,
				rows,
				cols,
				voxelRatio,
				color: axisColors[axis],
				transform: zoomIdentity
			};
		});

		this.activeTile = 'Settings';
	}

	getActiveVolume(): Volume | undefined {
		return this.volumes.find((volume) => volume.isActive);
	}

	setActiveVolume(volumeId: string): void {
		if (this.volumes.some((volume) => volume.id === volumeId)) {
			this.volumes.forEach((volume) => {
				volume.isActive = volume.id === volumeId;
			});
		}
	}

	toggleVisibility(volumeId: string): void {
		const volume = this.volumes.find((volume) => volume.id === volumeId);

		if (volume) {
			volume.isVisible = !volume.isVisible;
		}
	}

	removeVolume(volumeId: string): void {
		this.volumes = this.volumes.filter((volume) => volume.id !== volumeId);

		if (this.volumes.length === 0) {
			this.views = [];
			this.activeTile = 'Information';
		}
	}

	swapViews(current: number, target: number): void {
		const idxCurrent = this.views.findIndex((view) => view.axis === current);
		const idxTarget = this.views.findIndex((view) => view.axis === target);

		if (idxCurrent !== -1 && idxTarget !== -1) {
			const curreView = this.views[idxCurrent];
			this.views[idxCurrent] = this.views[idxTarget];
			this.views[idxTarget] = curreView;
		}
	}

	reset(): void {
		this.volumes = [];
		this.views = [];
		this.activeTile = 'Information';
	}

	nextSlice(axis: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.currentSlice = Math.min(view.slices, view.currentSlice + 1);
		}
	}

	previousSlice(axis: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.currentSlice = Math.max(0, view.currentSlice - 1);
		}
	}

	changeSlice(axis: number, currentSlice: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.currentSlice = Math.max(0, Math.min(view.slices, currentSlice));
		}
	}

	getSliceDataForView(axis: number, volumeID: string): TypedArray {
		const view = this.views.find((view) => view.axis === axis);
		const volume = this.volumes.find((volume) => volume.id === volumeID);

		if (!view) {
			throw new Error(`View with axis ${axis} not found.`);
		}

		if (!volume) {
			throw new Error(`Volume with ID ${volumeID} not found.`);
		}

		return extractSliceFromVolume(volume.header.dims, volume.data, view.axis, view.currentSlice);
	}

	setOpacity(opacity: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.opacity = Math.max(0, Math.min(1, opacity));
		}
	}

	setBrightness(brightness: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.brightnessFactor = Math.max(-1, Math.min(1, brightness));
		}
	}

	setContrast(contrast: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.contrastFactor = Math.max(0, Math.min(2, contrast));
		}
	}

	adjustBrightnessAndContrast(brightnessChange: number, contrastChange: number): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.brightnessFactor = Math.max(
				-1,
				Math.min(1, volume.brightnessFactor + brightnessChange)
			);
			volume.contrastFactor = Math.max(0, Math.min(2, volume.contrastFactor + contrastChange));
		}
	}

	resetBrightnessAndContrast(): void {
		const volume = this.volumes.find((volume) => volume.isActive);

		if (volume) {
			volume.brightnessFactor = 0;
			volume.contrastFactor = 1;
		}
	}

	setTransform(axis: number, transform: ZoomTransform): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.transform = transform;
		}
	}

	resetTransform(axis: number): void {
		const view = this.views.find((view) => view.axis === axis);

		if (view) {
			view.transform = zoomIdentity;
		}
	}
}

const VIEWER_KEY = Symbol('VIEWER');

export function setViewerState() {
	return setContext(VIEWER_KEY, new ViewerState());
}

export function getViewerState() {
	return getContext<ReturnType<typeof setViewerState>>(VIEWER_KEY);
}
