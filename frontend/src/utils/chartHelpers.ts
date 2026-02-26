import { HabitView } from '@/backend';
import { backendToDate, toDateKey } from './dateHelpers';

/**
 * Returns the number of days in a given month/year.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generates an array of { day, dateKey } for every day in the given month/year.
 * month is 0-indexed (0 = January).
 */
export function getDaysOfMonth(year: number, month: number): Array<{ day: number; dateKey: string }> {
  const count = getDaysInMonth(year, month);
  return Array.from({ length: count }, (_, i) => {
    const d = i + 1;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return { day: d, dateKey };
  });
}

/**
 * Aggregates daily completion counts for a given month across all habits.
 * Returns an array of { day, count, label } for each day in the month.
 */
export function aggregateMonthlyCompletions(
  habits: Array<[bigint, HabitView]>,
  year: number,
  month: number
): Array<{ day: number; count: number; label: string }> {
  const days = getDaysOfMonth(year, month);

  // Build a set of (habitId, dateKey) pairs for fast lookup
  const completionSet = new Set<string>();
  for (const [id, habit] of habits) {
    for (const exec of habit.executions) {
      const d = backendToDate(exec);
      const key = toDateKey(d);
      completionSet.add(`${id.toString()}::${key}`);
    }
  }

  return days.map(({ day, dateKey }) => {
    let count = 0;
    for (const [id] of habits) {
      if (completionSet.has(`${id.toString()}::${dateKey}`)) {
        count++;
      }
    }
    return { day, count, label: String(day) };
  });
}

/**
 * Returns a display string for a month/year (e.g., "February 2026").
 */
export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns the names of habits completed on a specific date.
 * @param dateKey - YYYY-MM-DD string
 * @param habits - full habits array
 */
export function getHabitsCompletedOnDate(
  dateKey: string,
  habits: Array<[bigint, HabitView]>
): string[] {
  const names: string[] = [];
  for (const [id, habit] of habits) {
    const completed = habit.executions.some((exec) => {
      const d = backendToDate(exec);
      return toDateKey(d) === dateKey;
    });
    if (completed) {
      names.push(habit.name);
    }
  }
  return names;
}
