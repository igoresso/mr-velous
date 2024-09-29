<svelte:options runes={true} />

<script lang="ts">
	import { getViewerState } from '$lib/viewer-state.svelte';
	import { Eye, EyeOff, X, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	const viewerState = getViewerState();
</script>

{#if viewerState.volumes.length > 0}
	<section class="flex flex-col space-y-2">
		<h2 class="text-lg font-semibold">Layers</h2>

		{#each viewerState.volumes as volume}
			<ul>
				<li class="flex items-center space-x-2 py-2">
					<Button
						variant="ghost"
						size="sm"
						class="p-2"
						onclick={() => viewerState.toggleVisibility(volume.id)}
					>
						{#if volume.isVisible}
							<Eye size="16" />
						{:else}
							<EyeOff size="16" />
						{/if}
						<span class="sr-only">Toggle visibility</span>
					</Button>
					<span class="grow truncate font-mono text-sm">{volume.fileName}</span>
					<Button
						variant="ghost"
						size="sm"
						class="p-2"
						onclick={() => viewerState.removeVolume(volume.id)}
					>
						<X class="h-4 w-4" />
						<span class="sr-only">Remove volume</span>
					</Button>
				</li>
				<Separator />
			</ul>
		{/each}
	</section>
{/if}
