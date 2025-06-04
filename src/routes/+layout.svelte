<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import {
		PanelLeftOpen,
		PanelLeftClose,
		Info,
		SlidersHorizontal,
		Moon,
		Sun,
		HelpCircle,
		Github
	} from 'lucide-svelte';
	import { setViewerState } from '$lib/context/viewer.svelte';
	import { setDialogState } from '$lib/context/dialog.svelte';
	import { setLoaderState } from '$lib/context/loader.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { Dialog, DialogContent } from '$lib/components/ui/dialog';
	import { Rail } from '$lib/components/custom/rail';
	import { About } from '$lib/components/custom/about';
	import { Information } from '$lib/components/custom/information';
	import { Layers } from '$lib/components/custom/layers';
	import { Dimensions } from '$lib/components/custom/dimensions';
	import { Adjustments } from '$lib/components/custom/adjustments';

	import '../app.pcss';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let { children }: { children: Snippet } = $props();

	const viewer = setViewerState();

	const dialog = setDialogState();

	setLoaderState(viewer);

	let innerWidth = $state(0);
	let isSidebarVisible = $state(false);

	$effect.pre(() => {
		isSidebarVisible = innerWidth >= 1024;
	});

	const tiles = $derived([
		{
			name: 'Open sidebar',
			icon: PanelLeftOpen,
			class: isSidebarVisible ? 'hidden' : '',
			onClick: (): void => {
				isSidebarVisible = !isSidebarVisible;
			}
		},
		{
			name: 'Close sidebar',
			icon: PanelLeftClose,
			class: isSidebarVisible ? '' : 'hidden',
			onClick: (): void => {
				isSidebarVisible = !isSidebarVisible;
			}
		},
		{
			name: 'Information',
			icon: Info,
			onClick: (): void => {
				isSidebarVisible = true;
				viewer.activeTile = 'Information';
			}
		},
		{
			name: 'Settings',
			icon: SlidersHorizontal,
			onClick: (): void => {
				isSidebarVisible = true;
				viewer.activeTile = 'Settings';
			},
			isDisabled: viewer.views.length === 0
		},
		{ name: 'Toggle theme', icon: Sun, class: 'mt-auto dark:hidden', onClick: toggleMode },
		{ name: 'Toggle theme', icon: Moon, class: 'mt-auto hidden dark:block', onClick: toggleMode },
		{
			name: 'About',
			icon: HelpCircle,
			isDialog: true,
			onClick: (): void => {
				dialog.openDialog(About);
			}
		},
		{ name: 'GitHub link', icon: Github, href: 'https://github.com/igoresso/mr-velous' }
	]);
</script>

<svelte:window bind:innerWidth />

<ModeWatcher />

<Toaster expand={true} richColors />

<TooltipProvider>
	{#if innerWidth > 0}
		<div class="flex h-full">
			<Rail {tiles} activeTile={isSidebarVisible ? viewer.activeTile : null} />

			{#if isSidebarVisible}
				<div
					class="shrink-0 border-r-2"
					transition:slide={{ duration: 500, easing: quintOut, axis: 'x' }}
				>
					<div class="flex h-full w-72 flex-col">
						<header class="border-b-2 p-3">
							<h1 class="text-center text-xl font-bold">MR.VELOUS</h1>
						</header>

						<ScrollArea class="h-full">
							<aside class="flex h-full grow flex-col gap-5 px-5 py-3">
								{#if viewer.activeTile === 'Information'}
									<Information />
								{:else if viewer.activeTile === 'Settings'}
									<Adjustments />
									<Dimensions />
									<Layers />
								{/if}
							</aside>
						</ScrollArea>
					</div>
				</div>
			{/if}

			<main class="relative min-w-80 grow overflow-hidden">
				{@render children()}
			</main>
		</div>
	{/if}
</TooltipProvider>

<Dialog bind:open={dialog.isOpen}>
	<DialogContent>
		{#if dialog.content}
			<dialog.content />
		{/if}
	</DialogContent>
</Dialog>
