import { getContext, setContext } from 'svelte';
import type { Mode, Cursor } from './index';

const modeToCursor = new Map<Mode, Cursor>([
	['cursor', 'cursor-crosshair'],
	['zoom', 'cursor-move']
]);

export class PanelState {
	activeMode = $state<Mode>('cursor');
	crosshair = $state(true);
	cursor = $derived(modeToCursor.get(this.activeMode));

	toggleCrosshair(): void {
		this.crosshair = !this.crosshair;
	}

	setActiveMode(mode: Mode): void {
		this.activeMode = mode;
	}
}

const PANEL_KEY = Symbol('PANEL');

export function setPanelState() {
	return setContext(PANEL_KEY, new PanelState());
}

export function getPanelState() {
	return getContext<ReturnType<typeof setPanelState>>(PANEL_KEY);
}
