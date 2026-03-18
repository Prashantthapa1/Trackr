/**
 * lib/utils.ts
 *
 * Utility for merging Tailwind classes. shadcn/ui components all import `cn()`
 * from here. It combines clsx (conditional classes) with tailwind-merge
 * (deduplication of conflicting Tailwind utilities like "p-2 p-4" → "p-4").
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
