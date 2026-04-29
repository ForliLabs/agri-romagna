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
