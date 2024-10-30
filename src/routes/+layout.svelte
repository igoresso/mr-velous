<svelte:options runes={true} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { Menu, Info, SlidersHorizontal, Moon, Sun, HelpCircle, Github } from 'lucide-svelte';
	import { setViewerState, getViewerState } from '$lib/viewer-state.svelte';
	import { setDialogState, getDialogState } from '$lib/dialog-state.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Rail } from '$lib/components/custom/rail';
	import { About } from '$lib/components/custom/about';
	import { Information } from '$lib/components/custom/information';
	import { Layers } from '$lib/components/custom/layers';
	import { Dimensions } from '$lib/components/custom/dimensions';
	import { Adjustments } from '$lib/components/custom/adjustments';

	import '../app.css';

	let { children }: { children: Snippet } = $props();

	setViewerState();
	const viewerState = getViewerState();

	setDialogState();
	const dialogState = getDialogState();

	let innerWidth = $state(0);
	let isToolbarVisible = $state(false);

	$effect.pre(() => {
		isToolbarVisible = innerWidth >= 1024;
	});

	const tiles = $derived([
		{
			name: 'Toggle toolbar',
			icon: Menu,
			onClick: (): void => {
				isToolbarVisible = !isToolbarVisible;
			}
		},
		{
			name: 'Information',
			icon: Info,
			onClick: (): void => {
				isToolbarVisible = true;
				viewerState.activeTile = 'Information';
			}
		},
		{
			name: 'Settings',
			icon: SlidersHorizontal,
			onClick: (): void => {
				isToolbarVisible = true;
				viewerState.activeTile = 'Settings';
			},
			isDisabled: viewerState.views.length === 0
		},
		{ name: 'Toggle theme', icon: Sun, class: 'mt-auto dark:hidden', onClick: toggleMode },
		{ name: 'Toggle theme', icon: Moon, class: 'mt-auto hidden dark:block', onClick: toggleMode },
		{
			name: 'About',
			icon: HelpCircle,
			isDialog: true,
			onClick: (): void => {
				dialogState.openDialog(About);
			}
		},
		{ name: 'GitHub link', icon: Github, href: 'https://github.com/igoresso/mr-velous' }
	]);
</script>

<svelte:window bind:innerWidth />

<ModeWatcher track={false} defaultMode={'dark'} />
<Toaster expand={true} richColors />
<TooltipProvider>
	{#if innerWidth > 0}
		<div class="flex h-full">
			<Rail {tiles} activeTile={isToolbarVisible ? viewerState.activeTile : null} />

			{#if isToolbarVisible}
				<div
					class="shrink-0 border-r-2"
					transition:slide={{ duration: 500, easing: quintOut, axis: 'x' }}
				>
					<div class="flex h-full w-72 flex-col">
						<header class="border-b-2 p-3">
							<h1 class="text-center text-xl font-bold">MR.VELOUS</h1>
						</header>

						<aside class="flex grow flex-col space-y-5 px-5 py-3">
							{#if viewerState.activeTile === 'Information'}
								<Information />
							{:else if viewerState.activeTile === 'Settings'}
								<Layers />
								<Dimensions />
								<Adjustments />
							{/if}
						</aside>
					</div>
				</div>
			{/if}

			<main class="min-w-80 grow">
				{@render children()}
			</main>
		</div>
	{/if}
</TooltipProvider>
<Dialog.Root bind:open={dialogState.isOpen}>
	<Dialog.Content>
		{#if dialogState.content}
			<dialogState.content />
		{/if}
	</Dialog.Content>
</Dialog.Root>
