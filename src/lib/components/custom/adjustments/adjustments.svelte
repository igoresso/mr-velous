<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { RotateCcw } from 'lucide-svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	const viewerState = getViewerState();

	let activeVolume = $derived(viewerState.getActiveVolume());
</script>

{#if activeVolume !== undefined}
	<section class="flex flex-col space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">Adjustments</h2>
			<Button
				variant="ghost"
				class="p-2"
				aria-label="Reset adjustments"
				onclick={() => viewerState.resetBrightnessAndContrast()}
			>
				<RotateCcw class="h-5 w-5" />
			</Button>
		</div>

		<div class="flex flex-col space-y-2">
			<Label for="opacity">Opacity</Label>
			<Slider
				id="opacity"
				min={0}
				max={1}
				value={[activeVolume.opacity]}
				step={0.01}
				aria-label="Opacity"
				onValueChange={(value) => viewerState.setOpacity(value[0])}
			/>
			<div class="flex justify-between">
				<span class="font-mono text-xs">Transparent</span>
				<span class="font-mono text-xs">Visible</span>
			</div>
		</div>
		<div class="flex flex-col space-y-2">
			<Label for="brightness">Brightness</Label>
			<Slider
				id="brightness"
				min={-1}
				max={1}
				value={[activeVolume.brightnessFactor]}
				step={0.01}
				aria-label="Brightness"
				onValueChange={(value) => viewerState.setBrightness(value[0])}
			/>
			<div class="flex justify-between">
				<span class="font-mono text-xs">Darker</span>
				<span class="font-mono text-xs">Lighter</span>
			</div>
		</div>
		<div class="flex flex-col space-y-2">
			<Label for="contrast">Contrast</Label>
			<Slider
				id="contrast"
				min={0}
				max={2}
				value={[activeVolume.contrastFactor]}
				step={0.01}
				aria-label="Contrast"
				onValueChange={(value) => viewerState.setContrast(value[0])}
			/>
			<div class="flex justify-between">
				<span class="font-mono text-xs">Low</span>
				<span class="font-mono text-xs">High</span>
			</div>
		</div>
	</section>
{/if}
