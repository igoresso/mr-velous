import { getContext, setContext } from 'svelte';
import type { Component as SvelteComponent } from 'svelte';

export class DialogState {
	isOpen = $state(false);
	content = $state<SvelteComponent | null>(null);

	openDialog(content: SvelteComponent): void {
		this.content = content;
		this.isOpen = true;
	}

	closeDialog(): void {
		this.isOpen = false;
		this.content = null;
	}
}

const VIEWER_KEY = Symbol('DIALOG');

export function setDialogState() {
	return setContext(VIEWER_KEY, new DialogState());
}

export function getDialogState() {
	return getContext<ReturnType<typeof setDialogState>>(VIEWER_KEY);
}
