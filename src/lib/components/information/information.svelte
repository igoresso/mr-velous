<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { Demo } from '$lib/components/demo';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input/index.js';

	const viewerState = getViewerState();

	function handleSliceChange(axis: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const currentSlice = Number(target.value) - 1;
		viewerState.changeSlice(axis, currentSlice);
	}
</script>

{#if viewerState.views.length === 0}
	<div class="flex flex-col space-y-2">
		<h2 class="text-lg font-medium">
			MR Viewer with Enhanced Layout and Optimised User Satisfaction
		</h2>

		<Separator />

		<p class="text-md font-thin">
			Explore medical images with ease and a touch of elegance. Enjoy a delightful experience as
			more features are on the way!
		</p>
	</div>

	<Demo />
{:else}
	<div class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Dimensions</h2>
		<div class="flex justify-between">
			<span class="grow text-center font-semibold">{viewerState.views[0].slices + 1}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{viewerState.views[1].slices + 1}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{viewerState.views[2].slices + 1}</span>
		</div>
	</div>

	<!-- <div class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Field of View</h2>
		<div class="flex justify-between">
			<span class="grow text-center font-semibold">{Math.round(fov[0])}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{Math.round(fov[1])}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{Math.round(fov[2])}</span>
		</div>
	</div> -->

	<div class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Current Slices</h2>
		<div class="flex justify-between space-x-2">
			<Input
				type="number"
				value={viewerState.views[0].currentSlice + 1}
				min={1}
				max={viewerState.views[0].slices + 1}
				oninput={(event) => handleSliceChange(1, event)}
			/>
			<Separator orientation="vertical" />
			<Input
				type="number"
				value={viewerState.views[1].currentSlice + 1}
				min={1}
				max={viewerState.views[1].slices + 1}
				oninput={(event) => handleSliceChange(2, event)}
			/>
			<Separator orientation="vertical" />
			<Input
				type="number"
				value={viewerState.views[2].currentSlice + 1}
				min={1}
				max={viewerState.views[2].slices + 1}
				oninput={(event) => handleSliceChange(3, event)}
			/>
		</div>
	</div>
{/if}
