<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';

	const viewerState = getViewerState();

	function handleSliceChange(axis: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const currentSlice = Number(target.value) - 1;
		viewerState.changeSlice(axis, currentSlice);
	}
</script>

{#if viewerState.volumes.length > 0}
	<section class="flex flex-col space-y-4">
		<h2 class="text-lg font-semibold">Dimensions</h2>
		<div class="flex items-center justify-between">
			{#each viewerState.views as view, i}
				{#if i !== 0}
					<Separator orientation="vertical" class="h-5" />
				{/if}
				<div class="flex flex-col space-y-1.5">
					<Label for={`axis-${view.axis}`}>Axis {view.axis}</Label>
					<Input
						id={`axis-${view.axis}`}
						type="number"
						value={view.currentSlice + 1}
						min={1}
						max={view.slices + 1}
						class="font-mono text-sm"
						oninput={(event) => handleSliceChange(1, event)}
					/>
					<span class="pl-3 text-xs text-muted-foreground">1 - {view.slices + 1}</span>
				</div>
			{/each}
		</div>
	</section>
{/if}
