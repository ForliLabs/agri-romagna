/**
 * @module utils
 * @description Shared UI utility functions.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution.
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (deduplication of conflicting Tailwind classes).
 *
 * @param inputs - Class values (strings, arrays, objects, etc.).
 * @returns The merged class name string.
 *
 * @example
 * ```ts
 * cn("px-2 py-1", condition && "bg-red-500", "px-4")
 * // → "py-1 bg-red-500 px-4" (px-2 is overridden by px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a prefixed unique identifier using `crypto.randomUUID()`.
 *
 * @param prefix - Short entity prefix (e.g., `"field"`, `"user"`, `"farm"`).
 * @returns A string like `"field-a1b2c3d4"`.
 *
 * @example
 * ```ts
 * generateId("field") // → "field-a1b2c3d4"
 * generateId("user")  // → "user-e5f6a7b8"
 * ```
 */
export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
