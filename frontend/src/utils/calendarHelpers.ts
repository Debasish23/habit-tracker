import { backendToDate, toDateKey } from './dateHelpers';

export interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
}

/**
 * Generate a calendar grid for a given month/year.
 * Returns weeks (arrays of 7 days), with padding days from adjacent months.
 */
export function generateMonthGrid(year: number, month: number): CalendarDay[][] {
  const today = new Date();
  const todayKey = toDateKey(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));

  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  // Day of week for first day (0=Sun, 1=Mon, ...)
  const startDow = firstDay.getUTCDay();
  const daysInMonth = lastDay.getUTCDate();

  const days: CalendarDay[] = [];

  // Padding from previous month
  for (let i = 0; i < startDow; i++) {
    const d = new Date(Date.UTC(year, month, -(startDow - 1 - i)));
    const key = toDateKey(d);
    days.push({
      date: d,
      dateKey: key,
      dayNumber: d.getUTCDate(),
      isCurrentMonth: false,
      isToday: key === todayKey,
      isFuture: d > new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
      isPast: d < new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(year, month, d));
    const key = toDateKey(date);
    const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    days.push({
      date,
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: key === todayKey,
      isFuture: date > todayDate,
      isPast: date < todayDate,
    });
  }

  // Padding to complete last week
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(Date.UTC(year, month + 1, i));
      const key = toDateKey(d);
      days.push({
        date: d,
        dateKey: key,
        dayNumber: d.getUTCDate(),
        isCurrentMonth: false,
        isToday: key === todayKey,
        isFuture: true,
        isPast: false,
      });
    }
  }

  // Split into weeks
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

/**
 * Get month name for display.
 */
export function getMonthName(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Check if a calendar day is completed given executions array.
 */
export function isDayCompleted(dateKey: string, executions: bigint[]): boolean {
  return executions.some(e => toDateKey(backendToDate(e)) === dateKey);
}

/**
 * Navigate to previous month.
 */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 0) return { year: year - 1, month: 11 };
  return { year, month: month - 1 };
}

/**
 * Navigate to next month.
 */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 11) return { year: year + 1, month: 0 };
  return { year, month: month + 1 };
}
