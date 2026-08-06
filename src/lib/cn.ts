import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, letting later Tailwind utilities win over
 * earlier conflicting ones. Lets callers override a component's defaults via
 * `className` without fighting CSS ordering.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
