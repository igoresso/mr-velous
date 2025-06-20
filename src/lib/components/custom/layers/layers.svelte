<script lang="ts">
	import { tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quadOut } from 'svelte/easing';
	import { draggable } from '$lib/actions/draggable';
	import { getViewerState } from '$lib/context/viewer.svelte';
	import { getLoaderState } from '$lib/context/loader.svelte';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import FilePlusIcon from '@lucide/svelte/icons/file-plus-2';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import { clamp } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	const viewerState = getViewerState();
	const loader = getLoaderState();

	let fileInput = $state<HTMLInputElement | null>(null);
	let hoverIndex = $state(Infinity);
	let maxIndex = $derived(viewerState.volumes.length - 1);
	let listItemRefs = $state<HTMLElement[]>([]);

	function handleDragStart(e: CustomEvent<{ x: number; y: number }>, index: number) {
		const element = e.currentTarget as HTMLElement;
		element.classList.add('opacity-50', 'z-10');
		hoverIndex = index;
	}

	function handleDragMove(
		e: CustomEvent<{ x: number; y: number; dx: number; dy: number }>,
		index: number
	) {
		const dy = e.detail.dy;
		const height = (e.currentTarget as HTMLElement).offsetHeight;
		hoverIndex = clamp(index + Math.floor(dy / height), -1, maxIndex);
	}

	function handleDragEnd(e: CustomEvent, index: number) {
		const element = e.currentTarget as HTMLElement;
		element.classList.remove('opacity-50', 'z-10');

		const targetIndex =
			hoverIndex >= index ? Math.min(hoverIndex, maxIndex) : Math.min(hoverIndex + 1, maxIndex);
		hoverIndex = Infinity;

		if (index !== targetIndex) {
			viewerState.moveLayer(index, targetIndex);
		}
	}

	async function handleKeyDown(event: KeyboardEvent, index: number) {
		if (event.key === 'ArrowUp' && index > 0) {
			event.preventDefault();
			viewerState.moveLayer(index, index - 1);
			await tick();
			focusLayerButton(index - 1);
		} else if (event.key === 'ArrowDown' && index < viewerState.volumes.length - 1) {
			event.preventDefault();
			viewerState.moveLayer(index, index + 1);
			await tick();
			focusLayerButton(index + 1);
		}
	}

	function focusLayerButton(targetIndex: number) {
		const focusTarget = listItemRefs[targetIndex]?.querySelector('button:last-child');
		if (focusTarget) {
			(focusTarget as HTMLElement).focus();
		}
	}

	$effect(() => {
		if (listItemRefs.length !== viewerState.volumes.length) {
			listItemRefs = new Array(viewerState.volumes.length).fill(null);
		}
	});
</script>

{#if viewerState.volumes.length > 0}
	<section class="flex flex-col gap-2">
		<div class="flex gap-2">
			<h2 class="flex-1 text-lg font-semibold">Layers</h2>
			<Button
				variant="ghost"
				size="sm"
				class="relative p-2"
				aria-label="Add new layer"
				disabled={loader.isLoading}
				onclick={() => fileInput?.click()}
			>
				<FilePlusIcon class="size-4" />
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
				<TrashIcon class="size-4" />
				<span class="sr-only">Remove volume</span>
			</Button>
		</div>

		<ul>
			<Separator class={hoverIndex === -1 ? 'bg-primary' : ''} />
			{#each viewerState.volumes as volume, index (volume)}
				<li
					transition:slide={{ duration: 200, easing: quadOut }}
					class="bg-background flex items-center gap-2 py-1"
					use:draggable
					ondndstart={(e) => handleDragStart(e, index)}
					ondndmove={(e) => handleDragMove(e, index)}
					ondndend={(e) => handleDragEnd(e, index)}
					bind:this={listItemRefs[index]}
				>
					<Button
						variant="ghost"
						size="sm"
						class="p-2"
						onclick={() => viewerState.toggleVisibility(volume.id)}
					>
						{#if volume.isVisible}
							<EyeIcon size="16" />
						{:else}
							<EyeOffIcon size="16" />
						{/if}
						<span class="sr-only">Toggle visibility</span>
					</Button>
					<Button
						variant="link"
						size="sm"
						class={`inline-block flex-1 justify-start truncate p-2 text-start font-mono ${volume.isActive && 'font-bold'}`}
						onclick={() => viewerState.setActiveVolume(volume.id)}
						onkeydown={(e) => handleKeyDown(e, index)}
					>
						{volume.fileName}
					</Button>
				</li>
				<Separator class={hoverIndex === index ? 'bg-primary' : ''} />
			{/each}
		</ul>
	</section>
{/if}
