<svelte:options runes={true} />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Locate, Move, Fullscreen } from 'lucide-svelte';
	import { Toggle } from '$lib/components/ui/toggle';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		activeMode: 'cursor' | 'zoom';
	};

	let { activeMode }: Props = $props();

	const dispatch = createEventDispatcher();
</script>

<Toggle
	aria-label="toggle cursor interaction"
	pressed={activeMode === 'cursor'}
	onPressedChange={() => dispatch('modechange', { mode: 'cursor' })}
>
	<Locate class="h-5 w-5" />
</Toggle>
<Toggle
	aria-label="toggle zoom"
	pressed={activeMode === 'zoom'}
	onPressedChange={() => dispatch('modechange', { mode: 'zoom' })}
>
	<Move class="h-5 w-5" />
</Toggle>

<Button variant="ghost" class="px-3" onclick={() => dispatch('resetview')}>
	<Fullscreen class="h-5 w-5" />
</Button>
