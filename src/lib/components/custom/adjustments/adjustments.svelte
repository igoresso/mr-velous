<script lang="ts">
	import RotateCcwSquareIcon from '@lucide/svelte/icons/rotate-ccw';

	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { getViewerState } from '$lib/context/viewer.svelte';

	const viewerState = getViewerState();

	let activeVolume = $derived(viewerState.getActiveVolume());
</script>

{#if activeVolume !== undefined}
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">Adjustments</h2>
			<Button
				variant="ghost"
				size="sm"
				class="p-2"
				aria-label="Reset adjustments"
				onclick={() => viewerState.resetBrightnessAndContrast()}
			>
				<RotateCcwSquareIcon class="size-4" />
			</Button>
		</div>

		<div class="flex flex-col gap-2">
			<Label for="opacity">Opacity</Label>
			<Slider
				type="single"
				id="opacity"
				min={0}
				max={1}
				value={activeVolume.opacity}
				step={0.01}
				aria-label="Opacity"
				onValueChange={(value) => viewerState.setOpacity(value)}
			/>
			<div class="flex justify-between">
				<span class="font-mono text-xs">Transparent</span>
				<span class="font-mono text-xs">Visible</span>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<Label for="brightness">Brightness</Label>
			<Slider
				type="single"
				id="brightness"
				min={-1}
				max={1}
				value={activeVolume.brightnessFactor}
				step={0.01}
				aria-label="Brightness"
				onValueChange={(value) => viewerState.setBrightness(value)}
			/>
			<div class="flex justify-between">
				<span class="font-mono text-xs">Darker</span>
				<span class="font-mono text-xs">Lighter</span>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<Label for="contrast">Contrast</Label>
			<Slider
				type="single"
				id="contrast"
				min={0}
				max={2}
				value={activeVolume.contrastFactor}
				step={0.01}
				aria-label="Contrast"
				onValueChange={(value) => viewerState.setContrast(value)}
			/>
			<div class="flex justify-between">
				<span class="font-mono text-xs">Low</span>
				<span class="font-mono text-xs">High</span>
			</div>
		</div>
	</section>
{/if}
