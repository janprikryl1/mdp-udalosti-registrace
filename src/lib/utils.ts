import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBirthDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  // If already in DD.MM.YYYY format
  if (/^\d{1,2}\.\s*\d{1,2}\.\s*\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  // If in YYYY-MM-DD format
  const parts = trimmed.split("-");
  if (parts.length === 3 && parts[0]?.length === 4) {
    const year = parts[0];
    const month = parseInt(parts[1] || "", 10);
    const day = parseInt(parts[2] || "", 10);
    if (!Number.isNaN(month) && !Number.isNaN(day)) {
      return `${day}. ${month}. ${year}`;
    }
  }
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    return new Intl.DateTimeFormat("cs-CZ").format(d);
  }
  return trimmed;
}
