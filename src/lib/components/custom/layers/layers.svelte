<script lang="ts">
	import { getViewerState } from '$lib/context/viewer.svelte';
	import { getLoaderState } from '$lib/context/loader.svelte';
	import { Eye, EyeOff, FilePlus2, Trash2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	const viewerState = getViewerState();
	const loader = getLoaderState();

	let fileInput: HTMLInputElement;
</script>

{#if viewerState.volumes.length > 0}
	<section class="flex flex-col space-y-2">
		<div class="flex space-x-2">
			<h2 class="grow text-lg font-semibold">Layers</h2>
			<Button
				variant="ghost"
				size="sm"
				class="relative p-2"
				disabled={loader.isLoading}
				onclick={() => fileInput.click()}
			>
				<FilePlus2 class="size-4" />
			</Button>
			<input
				type="file"
				bind:this={fileInput}
				accept={loader.acceptedExtensions}
				multiple={loader.multiple}
				aria-label="File input"
				onchange={(event) => loader.handleFiles(event)}
				disabled={loader.isLoading}
				hidden
			/>
			<Button
				variant="ghost"
				size="sm"
				class="p-2"
				onclick={() => viewerState.removeActiveVolume()}
			>
				<Trash2 class="size-4" />
				<span class="sr-only">Remove volume</span>
			</Button>
		</div>

		<ul>
			{#each viewerState.volumes as volume}
				<li class="space-x- flex items-center py-1">
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
					<Button
						variant="link"
						size="sm"
						class={`inline-block grow justify-start overflow-hidden truncate p-2 text-start font-mono text-sm ${volume.isActive && 'font-bold'}`}
						onclick={() => viewerState.setActiveVolume(volume.id)}
					>
						{volume.fileName}
					</Button>
				</li>
				<Separator />
			{/each}
		</ul>
	</section>
{/if}
