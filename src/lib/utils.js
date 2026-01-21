// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @param {...(string | null | undefined | {[key: string]: boolean} | any[])} inputs - The class inputs.
 * @returns {string} The merged and optimized class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}