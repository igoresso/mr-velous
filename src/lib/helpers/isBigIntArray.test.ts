// isBigIntArray.test.ts
import { describe, expect, it } from 'vitest';

import type { TypedArray } from '$lib/types';

import { isBigIntArray } from './isBigIntArray';

describe('isBigIntArray', () => {
	it('should return true for BigInt64Array', () => {
		const array = new BigInt64Array([1n, 2n, 3n]);
		expect(isBigIntArray(array)).toBe(true);
	});

	it('should return true for BigUint64Array', () => {
		const array = new BigUint64Array([1n, 2n, 3n]);
		expect(isBigIntArray(array)).toBe(true);
	});

	it('should return false for Int8Array', () => {
		const array = new Int8Array([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Uint8Array', () => {
		const array = new Uint8Array([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Uint8ClampedArray', () => {
		const array = new Uint8ClampedArray([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Int16Array', () => {
		const array = new Int16Array([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Uint16Array', () => {
		const array = new Uint16Array([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Int32Array', () => {
		const array = new Int32Array([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Uint32Array', () => {
		const array = new Uint32Array([1, 2, 3]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Float32Array', () => {
		const array = new Float32Array([1.0, 2.0, 3.0]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for Float64Array', () => {
		const array = new Float64Array([1.0, 2.0, 3.0]);
		expect(isBigIntArray(array)).toBe(false);
	});

	it('should return false for regular arrays', () => {
		const array = [1, 2, 3];
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});

	it('should return false for null', () => {
		const array = null;
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});

	it('should return false for undefined', () => {
		const array = undefined;
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});

	it('should return false for empty object', () => {
		const array = {};
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});

	it('should return false for a string', () => {
		const array = 'test';
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});

	it('should return false for a number', () => {
		const array = 123;
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});

	it('should return false for a BigInt value', () => {
		const array = 123n;
		expect(isBigIntArray(array as unknown as TypedArray)).toBe(false);
	});
});
