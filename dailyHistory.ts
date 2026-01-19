
import { DailyHistoryEntry } from './types';

const DAILY_HISTORY_KEY = 'dailyHistory';
const MAX_HISTORY_ENTRIES = 30;

export function getDailyHistory(): DailyHistoryEntry[] {
  try {
    const stored = localStorage.getItem(DAILY_HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDailyHistory(entry: DailyHistoryEntry): void {
  const history = getDailyHistory();
  
  // Add new entry at the beginning
  history.unshift(entry);
  
  // Trim to max entries
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.splice(MAX_HISTORY_ENTRIES);
  }
  
  localStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(history));
}

export function clearDailyHistory(): void {
  localStorage.removeItem(DAILY_HISTORY_KEY);
}

export function createDailyHistoryEntry(
  participantsOrder: string[],
  nextOwner: string,
  totalDuration: number
): DailyHistoryEntry {
  const now = new Date();
  return {
    id: `${now.toISOString().split('T')[0]}-${now.getTime()}`,
    date: now.toISOString(),
    participantsOrder,
    nextOwner,
    totalDuration,
    createdAt: now.toISOString()
  };
}
