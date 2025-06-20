<script lang="ts">
	import Axis3DIcon from '@lucide/svelte/icons/axis-3d';
	import LocateIcon from '@lucide/svelte/icons/locate';
	import MoveIcon from '@lucide/svelte/icons/move';
	import FullscreenIcon from '@lucide/svelte/icons/fullscreen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import RotateCwSquareIcon from '@lucide/svelte/icons/rotate-cw-square';
	import { getViewerState } from '$lib/context/viewer.svelte';
	import { getPanelState } from './panel-state.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Select from '$lib/components/ui/select';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Toggle } from '$lib/components/ui/toggle';
	import { Button } from '$lib/components/ui/button';
	import type { View } from '$lib/types';
	import type { Mode } from './index';

	type Props = {
		view: View;
		width: number;
	};

	let { view, width }: Props = $props();

	const viewerState = getViewerState();
	const panelState = getPanelState();

	const axes = [
		{ value: '0', label: 'Axis 1' },
		{ value: '1', label: 'Axis 2' },
		{ value: '2', label: 'Axis 3' }
	];

	function getActiveAxis(): string {
		return view.axis.toString();
	}

	function setActiveAxis(axis: string): void {
		viewerState.swapViews(view.axis, parseInt(axis));
	}

	function handleAxisChange(axis: string): void {
		viewerState.swapViews(view.axis, parseInt(axis));
	}

	function getActiveMode(): Mode {
		return panelState.activeMode;
	}

	function setActiveMode(mode: string): void {
		panelState.setActiveMode(mode);
	}

	function handleModeChange(mode: string): void {
		panelState.setActiveMode(mode);
	}
</script>

{#if width > 420}
	<div class="mr-auto flex gap-1">
		<Select.Root type="single" items={axes} bind:value={getActiveAxis, setActiveAxis}>
			<Select.Trigger class="mr-auto w-28" aria-label="Select axis">
				<Axis3DIcon class="size-4" />
				{axes[view.axis].label}
			</Select.Trigger>
			<Select.Content side="bottom">
				{#each axes.values() as axis (axis)}
					<Select.Item value={axis.value} label={axis.label}>{axis.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="px-3"
						onclick={() => viewerState.rotateViews()}
						aria-label="Rotate views"
					>
						<RotateCwSquareIcon class="size-4" />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Rotate views</span>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>

	<ToggleGroup.Root
		type="single"
		variant="outline"
		class="gap-0"
		bind:value={getActiveMode, setActiveMode}
	>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<ToggleGroup.Item
						{...props}
						value="zoom"
						class="rounded-r-none border-r-0"
						aria-label="Toggle move/zoom"
					>
						<MoveIcon class="size-4" />
					</ToggleGroup.Item>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Move/zoom</span>
			</Tooltip.Content>
		</Tooltip.Root>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<ToggleGroup.Item
						{...props}
						value="cursor"
						class="rounded-l-none border-l-0"
						aria-label="Toggle cursor"
					>
						<LocateIcon class="size-4" />
					</ToggleGroup.Item>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Cursor</span>
			</Tooltip.Content>
		</Tooltip.Root>
	</ToggleGroup.Root>

	<Separator orientation="vertical" />

	<div class="flex gap-1">
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Toggle
						{...props}
						aria-label="Toggle crosshair"
						pressed={panelState.crosshair}
						onPressedChange={() => panelState.toggleCrosshair()}
					>
						<PlusIcon class="size-4" />
					</Toggle>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="left">
				<span>Toggle crosshair</span>
			</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Toggle
						{...props}
						aria-label="Toggle directions"
						pressed={panelState.directions}
						onPressedChange={() => panelState.toggleDirections()}
					>
						<CompassIcon class="size-4" />
					</Toggle>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="bottom">
				<span>Toggle directions</span>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>

	<Separator orientation="vertical" />

	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					class="px-3"
					onclick={() => viewerState.resetTransform(view.axis)}
					aria-label="Reset view"
				>
					<FullscreenIcon class="size-4" />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content side="bottom">
			<span>Reset view</span>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger aria-label="Open controls">
			{#snippet child({ props })}
				<Button {...props} variant="ghost">
					<EllipsisIcon class="size-4" />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content class="w-56" collisionPadding={28}>
			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger>Select axis</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent>
					{#each axes.values() as axis (axis)}
						<DropdownMenu.CheckboxItem
							checked={view.axis === Number(axis.value)}
							onCheckedChange={() => handleAxisChange(axis.value)}
						>
							{axis.label}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>
			<DropdownMenu.Separator />
			<DropdownMenu.Label>Controls</DropdownMenu.Label>
			<DropdownMenu.RadioGroup value={panelState.activeMode} onValueChange={handleModeChange}>
				<DropdownMenu.RadioItem value="cursor">Cursor</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="zoom">Move / zoom</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
			<DropdownMenu.Separator />
			<DropdownMenu.Label>Visuals</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Item onclick={() => panelState.toggleCrosshair()}>
					<PlusIcon class="mr-2 h-4 w-4" />
					Toggle crosshair
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => panelState.toggleDirections()}>
					<CompassIcon class="mr-2 h-4 w-4" />
					Toggle directions
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => viewerState.resetTransform(view.axis)}>
					<FullscreenIcon class="mr-2 h-4 w-4" />
					Reset view
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
