<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { Demo } from '$lib/components/demo';
	import { Separator } from '$lib/components/ui/separator';

	const viewerState = getViewerState();
</script>

<div class="flex flex-col space-y-2">
	<h2 class="text-lg font-medium">
		MR Viewer with Enhanced Layout and Optimised User Satisfaction
	</h2>

	<Separator />

	<p class="text-md font-thin">
		Explore medical images with ease and a touch of elegance. Enjoy a delightful experience as more
		features are on the way!
	</p>
</div>

{#if viewerState.views.length === 0}
	<Demo />
{/if}
