/**
 * Date utility functions for converting between JS Date and backend Date_ (bigint) format.
 * The backend uses Unix timestamps in seconds (Int/bigint).
 */

/**
 * Convert a JS Date to backend Date_ (bigint seconds, normalized to midnight UTC).
 */
export function dateToBackend(date: Date): bigint {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return BigInt(Math.floor(normalized.getTime() / 1000));
}

/**
 * Convert backend Date_ (bigint seconds) to JS Date (midnight UTC).
 */
export function backendToDate(ts: bigint): Date {
  return new Date(Number(ts) * 1000);
}

/**
 * Get today's date as backend Date_ (midnight UTC).
 */
export function todayAsBackend(): bigint {
  return dateToBackend(new Date());
}

/**
 * Get today's date normalized to midnight UTC.
 */
export function todayNormalized(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Check if a backend Date_ represents today.
 */
export function isToday(ts: bigint): boolean {
  const d = backendToDate(ts);
  const today = todayNormalized();
  return d.getTime() === today.getTime();
}

/**
 * Check if a backend Date_ is in the future.
 */
export function isFuture(ts: bigint): boolean {
  const d = backendToDate(ts);
  const today = todayNormalized();
  return d.getTime() > today.getTime();
}

/**
 * Format a date for display (e.g., "Mon, Jan 15").
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Compute the current streak from an array of execution timestamps.
 * Streak = consecutive days ending on today or yesterday.
 */
export function computeStreak(executions: bigint[]): number {
  if (executions.length === 0) return 0;

  // Convert to set of day strings for O(1) lookup
  const daySet = new Set<string>();
  for (const ts of executions) {
    const d = backendToDate(ts);
    daySet.add(toDateKey(d));
  }

  const today = todayNormalized();
  const todayKey = toDateKey(today);
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayKey = toDateKey(yesterday);

  // Streak must end on today or yesterday
  let startDay: Date;
  if (daySet.has(todayKey)) {
    startDay = today;
  } else if (daySet.has(yesterdayKey)) {
    startDay = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  let current = new Date(startDay.getTime());

  while (daySet.has(toDateKey(current))) {
    streak++;
    current = new Date(current.getTime() - 86400000);
  }

  return streak;
}

/**
 * Convert a Date to a YYYY-MM-DD key string.
 */
export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Check if a backend Date_ is in the executions array.
 */
export function isCompleted(ts: bigint, executions: bigint[]): boolean {
  const key = toDateKey(backendToDate(ts));
  return executions.some(e => toDateKey(backendToDate(e)) === key);
}
