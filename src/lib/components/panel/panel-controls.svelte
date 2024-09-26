<svelte:options runes={true} />

<script lang="ts">
	import { Locate, Move, Fullscreen, Plus } from 'lucide-svelte';
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { getPanelState } from './panel-state.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { Toggle } from '$lib/components/ui/toggle';
	import { Button } from '$lib/components/ui/button';
	import type { View } from '$lib/types';
	import type { Mode } from './index';

	type Props = {
		view: View;
	};

	let { view }: Props = $props();

	const viewerState = getViewerState();
	const panelState = getPanelState();

	function handleModeChange(value: string | undefined) {
		if (value) {
			panelState.setActiveMode(value as Mode);
		}
	}
</script>

<ToggleGroup.Root type="single" value={panelState.activeMode} onValueChange={handleModeChange}>
	<ToggleGroup.Item value="cursor" aria-label="toggle cursor interaction">
		<Locate class="h-5 w-5" />
	</ToggleGroup.Item>
	<ToggleGroup.Item value="zoom" aria-label="toggle zoom">
		<Move class="h-5 w-5" />
	</ToggleGroup.Item>
</ToggleGroup.Root>

<Separator orientation="vertical" />

<div>
	<Toggle
		aria-label="toggle cursor interaction"
		pressed={panelState.crosshair}
		onPressedChange={() => panelState.toggleCrosshair()}
	>
		<Plus class="h-5 w-5" />
	</Toggle>

	<Button variant="ghost" class="px-3" onclick={() => viewerState.resetTransform(view.axis)}>
		<Fullscreen class="h-5 w-5" />
	</Button>
</div>
