<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { ChevronsUpDown, X } from 'lucide-svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input/index.js';

	const viewerState = getViewerState();

	let activeVolume = $derived(viewerState.views[0].fileName);
	let views = $derived(viewerState.views);
	let dims = $derived(viewerState.views[0].header.dims);
	let fov = $derived(viewerState.views[0].fov);
	let slice_1 = $derived(viewerState.views[0].slice);
	let slice_2 = $derived(viewerState.views[1].slice);
	let slice_3 = $derived(viewerState.views[2].slice);

	function handleSliceChange(id: string, event: Event) {
		const target = event.target as HTMLInputElement;
		const slice = Number(target.value) - 1;
		viewerState.changeSlice(id, slice);
	}
</script>

{#if viewerState.views.length === 0}
	<h2 class="text-lg font-medium">
		MR Viewer with Enhanced Layout and Optimised User Satisfaction
	</h2>

	<Separator />

	<p class="text-md font-thin">
		Explore medical images with ease and a touch of elegance. Enjoy a delightful experience as more
		features are on the way!
	</p>
{:else}
	<Collapsible.Root class="space-y-2">
		<div class="flex items-center justify-between space-x-4">
			<h2 class="text-lg font-semibold">Volume</h2>
			<Collapsible.Trigger asChild let:builder>
				<Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0" disabled>
					<ChevronsUpDown size="18" />
					<span class="sr-only">Toggle</span>
				</Button>
			</Collapsible.Trigger>
		</div>
		<div class="flex items-center justify-between space-x-4 rounded-md border px-4 py-3">
			<span class="truncate font-mono text-sm">{activeVolume}</span>
			<Button variant="ghost" size="sm" class="p-2" onclick={() => viewerState.reset()}>
				<X size="16" />
				<span class="sr-only">Remove volume</span>
			</Button>
		</div>
		<!-- <Collapsible.Content class="space-y-2"></Collapsible.Content> -->
	</Collapsible.Root>

	<div class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Dimensions</h2>
		<div class="flex justify-between">
			<span class="grow text-center font-semibold">{dims[1]}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{dims[2]}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{dims[3]}</span>
		</div>
	</div>

	<div class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Field of View</h2>
		<div class="flex justify-between">
			<span class="grow text-center font-semibold">{Math.round(fov[0])}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{Math.round(fov[1])}</span>
			<Separator orientation="vertical" />
			<span class="grow text-center font-semibold">{Math.round(fov[2])}</span>
		</div>
	</div>

	<div class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Current Slices</h2>
		<div class="flex justify-between space-x-2">
			<Input
				type="number"
				value={slice_1 + 1}
				min={1}
				max={dims[1]}
				oninput={(event) => handleSliceChange(views[0].id, event)}
			/>
			<Separator orientation="vertical" />
			<Input
				type="number"
				value={slice_2 + 1}
				min={1}
				max={dims[2]}
				oninput={(event) => handleSliceChange(views[1].id, event)}
			/>
			<Separator orientation="vertical" />
			<Input
				type="number"
				value={slice_3 + 1}
				min={1}
				max={dims[3]}
				oninput={(event) => handleSliceChange(views[2].id, event)}
			/>
		</div>
	</div>
{/if}
