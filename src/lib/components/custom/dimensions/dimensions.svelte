<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { getViewerState } from '$lib/context/viewer.svelte';

	const viewerState = getViewerState();

	let viewsSorted = viewerState.views.toSorted((a, b) => a.axis - b.axis);

	function handleSliceChange(axis: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const currentSlice = Number(target.value) - 1;
		viewerState.changeSlice(axis, currentSlice);
	}
</script>

{#if viewerState.volumes.length > 0}
	<section class="flex flex-col gap-4">
		<h2 class="text-lg font-semibold">Dimensions</h2>
		<div class="flex items-center justify-between">
			{#each viewsSorted as view, index (view)}
				{#if index !== 0}
					<div class="h-5">
						<Separator orientation="vertical" />
					</div>
				{/if}
				<div class="flex flex-col gap-1.5">
					<Label for={`axis-${view.axis}`}>Axis {view.axis + 1}</Label>
					<Input
						id={`axis-${view.axis}`}
						type="number"
						value={view.currentSlice + 1}
						min={1}
						max={view.slices + 1}
						class="font-mono text-sm"
						oninput={(event) => handleSliceChange(view.axis, event)}
					/>
					<span class="text-muted-foreground pl-3 text-xs">1 - {view.slices + 1}</span>
				</div>
			{/each}
		</div>
	</section>
{/if}
