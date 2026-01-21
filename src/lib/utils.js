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

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - The minimum integer value.
 * @param {number} max - The maximum integer value.
 * @returns {number} A random integer between min and max.
 */
export function getRandomInt(min, max) {
  // Ensure the min and max are inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  // The formula to get a random integer in a specific range
  return Math.floor(Math.random() * (max - min + 1)) + min;
}