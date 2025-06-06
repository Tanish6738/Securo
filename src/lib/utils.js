import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID
 * @returns {string} - A unique ID string
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format a date string to a readable format
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString();
}
