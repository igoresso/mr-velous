import type { ActionReturn } from 'svelte/action';

const THRESHOLD_PX = 5;

export interface DraggableOptions {
	axis?: 'x' | 'y';
	bounds?: 'parent' | HTMLElement | DOMRect;
	disabled?: boolean;
	handle?: string | HTMLElement;
}

interface DraggableAttributes {
	ondndstart?: (e: CustomEvent<{ x: number; y: number; event: PointerEvent }>) => void;
	ondndmove?: (
		e: CustomEvent<{ x: number; y: number; dx: number; dy: number; event: PointerEvent }>
	) => void;
	ondndend?: (
		e: CustomEvent<{ x: number; y: number; dx: number; dy: number; event: PointerEvent }>
	) => void;
}

export function draggable<T extends HTMLElement>(
	node: T,
	{ axis, bounds, disabled, handle }: DraggableOptions = {}
): ActionReturn<DraggableOptions, DraggableAttributes> {
	let ghost: T | null = null;
	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let frame: number | null = null;
	let isDragging = false;

	node.style.touchAction = 'none'; // stops scrolling
	node.style.userSelect = 'none'; // stops text selection

	function getRect(): DOMRect | null {
		if (!bounds) return null;
		if (bounds === 'parent') return node.parentElement?.getBoundingClientRect() ?? null;
		return bounds instanceof HTMLElement ? bounds.getBoundingClientRect() : bounds;
	}

	function applyBounds(x: number, y: number) {
		const r = getRect();
		if (!r) return { x, y };
		const nr = node.getBoundingClientRect();
		const minX = r.left - nr.left;
		const maxX = r.right - nr.right;
		const minY = r.top - nr.top;
		const maxY = r.bottom - nr.bottom;
		return {
			x: Math.min(Math.max(x, minX), maxX),
			y: Math.min(Math.max(y, minY), maxY)
		};
	}

	function isValidHandle(target: EventTarget | null): boolean {
		if (!handle) return true;
		if (!target || !(target instanceof Element)) return false;
		if (typeof handle === 'string') {
			if (target.matches(handle)) return true;
			const handleElement = node.querySelector(handle);
			return handleElement ? handleElement.contains(target as Node) : false;
		} else if (handle instanceof HTMLElement) {
			return handle === target || handle.contains(target as Node);
		}
		return false;
	}

	function handlePointerDown(e: PointerEvent) {
		if (disabled || e.button !== 0) return;

		pointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;

		window.addEventListener('pointermove', handlePointerMove, { passive: false });
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerUp);
		window.addEventListener('blur', handleWindowBlur);
	}

	function handlePointerMove(e: PointerEvent) {
		if (e.pointerId !== pointerId || !isValidHandle(e.target)) return;

		e.preventDefault();

		let dx = e.clientX - startX;
		let dy = e.clientY - startY;

		if (!isDragging) {
			if (Math.hypot(dx, dy) < THRESHOLD_PX) return;

			isDragging = true;
			node.setPointerCapture(pointerId!);
			node.style.cursor = 'grabbing';

			// Ghost
			const rect = node.getBoundingClientRect();
			ghost = node.cloneNode(true) as T;
			Object.assign(ghost.style, {
				position: 'fixed',
				left: `${rect.left}px`,
				top: `${rect.top}px`,
				width: `${rect.width}px`,
				height: `${rect.height}px`,
				margin: '0',
				pointerEvents: 'none',
				willChange: 'transform',
				zIndex: '1000',
				opacity: '0.5',
				borderRadius: '0.5rem'
			});
			document.body.appendChild(ghost);

			node.dispatchEvent(
				new CustomEvent('dndstart', {
					detail: { x: startX, y: startY, event: e }
				})
			);
		}

		if (axis === 'x') dy = 0;
		if (axis === 'y') dx = 0;

		const finalDX = e.clientX - startX;
		const finalDY = e.clientY - startY;
		const { x, y } = applyBounds(finalDX, finalDY);

		if (frame != null) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			if (ghost) {
				ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			}
			node.dispatchEvent(
				new CustomEvent('dndmove', {
					detail: { x, y, dx: finalDX, dy: finalDY, event: e }
				})
			);
			frame = null;
		});
	}

	function handlePointerUp(e?: PointerEvent) {
		if (e?.pointerId !== pointerId) return;

		if (isDragging) {
			isDragging = false;
			node.releasePointerCapture(pointerId!);
			pointerId = null;

			const finalDX = e.clientX - startX;
			const finalDY = e.clientY - startY;
			const { x, y } = applyBounds(finalDX, finalDY);

			node.dispatchEvent(
				new CustomEvent('dndend', {
					detail: { x, y, dx: finalDX, dy: finalDY, event: e }
				})
			);

			node.style.cursor = '';

			if (ghost) {
				ghost.remove();
				ghost = null;
			}
		}

		if (frame != null) cancelAnimationFrame(frame);
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
		window.removeEventListener('pointercancel', handlePointerUp);
		window.removeEventListener('blur', handleWindowBlur);
	}

	function handleWindowBlur() {
		handlePointerUp();
	}

	node.addEventListener('pointerdown', handlePointerDown);

	return {
		update(newOptions) {
			axis = newOptions.axis;
			bounds = newOptions.bounds;
			disabled = newOptions.disabled ?? false;
		},
		destroy() {
			node.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
			window.removeEventListener('pointercancel', handlePointerUp);
			window.removeEventListener('blur', handleWindowBlur);
			if (ghost) ghost.remove();
		}
	};
}
