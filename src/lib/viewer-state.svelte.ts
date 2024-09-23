import { getContext, setContext } from 'svelte';
import type { TypedArray, Dataset, View } from '$lib/types';

export class ViewerState {
	views = $state<View[]>([]);

	add(fileName: string, dataset: Dataset): void {
		const { min, max } = this.computeMinAndMax(dataset.data);

		this.views.push({
			id: crypto.randomUUID(),
			fileName,
			header: dataset.header,
			data: dataset.data,
			axis: 1,
			slice: Math.floor(dataset.header.dims[1] / 2),
			rows: dataset.header.dims[3],
			cols: dataset.header.dims[2],
			fov: [
				dataset.header.dims[1] * dataset.header.pixDims[1],
				dataset.header.dims[2] * dataset.header.pixDims[2],
				dataset.header.dims[3] * dataset.header.pixDims[3]
			],
			voxelRatio: dataset.header.pixDims[2] / dataset.header.pixDims[3],
			min,
			max
		});

		this.views.push({
			id: crypto.randomUUID(),
			fileName,
			header: dataset.header,
			data: dataset.data,
			axis: 2,
			slice: Math.floor(dataset.header.dims[2] / 2),
			rows: dataset.header.dims[3],
			cols: dataset.header.dims[1],
			fov: [
				dataset.header.dims[1] * dataset.header.pixDims[1],
				dataset.header.dims[1] * dataset.header.pixDims[1],
				dataset.header.dims[3] * dataset.header.pixDims[3]
			],
			voxelRatio: dataset.header.pixDims[1] / dataset.header.pixDims[3],
			min,
			max
		});

		this.views.push({
			id: crypto.randomUUID(),
			fileName,
			header: dataset.header,
			data: dataset.data,
			axis: 3,
			slice: Math.floor(dataset.header.dims[3] / 2),
			rows: dataset.header.dims[2],
			cols: dataset.header.dims[1],
			fov: [
				dataset.header.dims[1] * dataset.header.pixDims[1],
				dataset.header.dims[1] * dataset.header.pixDims[1],
				dataset.header.dims[2] * dataset.header.pixDims[2]
			],
			voxelRatio: dataset.header.pixDims[1] / dataset.header.pixDims[2],
			min,
			max
		});
	}

	changeSlice(id: string, slice: number): void {
		const view = this.views.find((view) => view.id === id);
		if (view) {
			const maxSlice = view.header.dims[view.axis] - 1;
			view.slice = Math.max(0, Math.min(maxSlice, slice));
		}
	}

	nextSlice(id: string): void {
		const view = this.views.find((view) => view.id === id);
		if (view) view.slice = Math.min(view.header.dims[view.axis] - 1, view.slice + 1);
	}

	previousSlice(id: string): void {
		const view = this.views.find((view) => view.id === id);
		if (view) view.slice = Math.max(0, view.slice - 1);
	}

	reset() {
		this.views = [];
	}

	private computeMinAndMax(data: TypedArray): { min: number; max: number } {
		let min = Infinity;
		let max = -Infinity;

		for (let i = 0; i < data.length; i++) {
			const value = data[i];
			if (value < min) min = value;
			if (value > max) max = value;
		}

		if (min === max) {
			min = 0;
			max = 1;
		}

		return { min, max };
	}
}

const VIEWER_KEY = Symbol('VIEWER');

export function setViewerState() {
	return setContext(VIEWER_KEY, new ViewerState());
}

export function getViewerState() {
	return getContext<ReturnType<typeof setViewerState>>(VIEWER_KEY);
}
