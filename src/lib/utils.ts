import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class strings, resolving conflicts with `tailwind-merge`.
 *
 * Accepts the same inputs as `clsx` (strings, arrays, conditional objects)
 * and returns a single de-duplicated class string. Used across every UI
 * component in the project — keep the API stable.
 *
 * @example cn("p-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
