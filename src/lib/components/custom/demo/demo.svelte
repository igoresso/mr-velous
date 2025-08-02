<script lang="ts">
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import TelescopeIcon from '@lucide/svelte/icons/telescope';

	import { Button } from '$lib/components/ui/button';
	import { getLoaderState } from '$lib/context/loader.svelte';

	const loader = getLoaderState();
</script>

<Button class="ring-offset-2" onclick={() => loader.loadDemo()} disabled={loader.isLoading}>
	{#if loader.isLoading}
		<LoaderCircleIcon class="mr-2 h-4 w-4 animate-spin" />
	{:else}
		<TelescopeIcon class="mr-2 h-4 w-4" />
	{/if}
	Explore a demo
</Button>
