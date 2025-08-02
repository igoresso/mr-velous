<script lang="ts">
	import LockIcon from '@lucide/svelte/icons/lock';

	import * as Alert from '$lib/components/ui/alert';
	import { Demo } from '$lib/components/custom/demo';
	import { Separator } from '$lib/components/ui/separator';
	import { getViewerState } from '$lib/context/viewer.svelte';

	const viewerState = getViewerState();
</script>

<div class="flex shrink-0 flex-col gap-2">
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

<Alert.Root class="!mt-auto" variant="destructive">
	<LockIcon class="h-4 w-4" />
	<Alert.Title>Privacy First</Alert.Title>
	<Alert.Description
		>Everything runs locally — your data never leaves your device.</Alert.Description
	>
</Alert.Root>
