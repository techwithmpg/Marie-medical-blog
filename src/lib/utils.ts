import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministically formats ISO date strings for admin views to prevent SSR hydration mismatch.
 * Returns ISO date format YYYY-MM-DD (e.g. 2026-08-25).
 */
export function formatAdminDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().slice(0, 10);
  } catch {
    return dateStr || "—";
  }
}
