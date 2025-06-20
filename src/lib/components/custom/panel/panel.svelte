<script lang="ts">
	import { setPanelState } from './panel-state.svelte';
	import Canvas from './panel-canvas.svelte';
	import Controls from './panel-controls.svelte';
	import type { View } from '$lib/types';

	type Props = {
		view: View;
	};

	let { view }: Props = $props();

	setPanelState();

	let width = $state(0);
	let height = $state(0);
</script>

<div class="flex h-full flex-col gap-4 p-4">
	<div class="flex justify-end gap-3">
		<Controls {view} {width} />
	</div>
	<div class="relative flex-1">
		<div
			style={`border-color: ${view.color};`}
			class="absolute inset-0 overflow-clip rounded-xl border-2 bg-black"
			bind:clientWidth={width}
			bind:clientHeight={height}
		>
			<Canvas {view} {width} {height} />
		</div>
	</div>
</div>
