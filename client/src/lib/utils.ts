import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'PPp'); // Format: "Apr 29, 2023, 1:00 PM"
}

export function formatTimeOnly(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'p'); // Format: "1:00 PM"
}

export function formatToday(): string {
  return format(new Date(), 'MMM d, yyyy');
}

export function calculateTimeLeft(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  const diffMs = parsedDate.getTime() - now.getTime();
  
  if (diffMs < 0) {
    return 'Overdue';
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minutes left`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} left`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
}

// Generate a random number between min and max (inclusive)
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate coins earned based on score and game type
export function calculateCoinsEarned(score: number, gameType: string): number {
  switch (gameType) {
    case 'memory':
      return Math.min(Math.floor(score / 2), 20); // Max 20 coins
    case 'reaction':
      // For reaction time, lower is better
      // Score is in ms, so we convert to a 0-100 scale where 600+ ms = 0, 200 ms = 100
      const normalizedScore = Math.max(0, 100 - Math.floor((score - 200) / 4));
      return Math.min(Math.floor(normalizedScore / 7), 15); // Max 15 coins
    default:
      return 0;
  }
}
