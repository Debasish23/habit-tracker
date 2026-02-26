import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HabitId } from '@/backend';
import {
  generateMonthGrid,
  getMonthName,
  isDayCompleted,
  prevMonth,
  nextMonth,
} from '@/utils/calendarHelpers';
import { dateToBackend } from '@/utils/dateHelpers';
import { useMarkComplete, useUnmarkComplete } from '@/hooks/useQueries';

interface HabitCalendarProps {
  habitId: HabitId;
  executions: bigint[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitCalendar({ habitId, executions }: HabitCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const markComplete = useMarkComplete();
  const unmarkComplete = useUnmarkComplete();

  const weeks = generateMonthGrid(viewYear, viewMonth);

  const handlePrev = () => {
    const { year, month } = prevMonth(viewYear, viewMonth);
    setViewYear(year);
    setViewMonth(month);
  };

  const handleNext = () => {
    const { year, month } = nextMonth(viewYear, viewMonth);
    setViewYear(year);
    setViewMonth(month);
  };

  const handleDayClick = (dateKey: string, date: Date, isFuture: boolean) => {
    if (isFuture) return;
    const ts = dateToBackend(date);
    const completed = isDayCompleted(dateKey, executions);
    setPendingKey(dateKey);

    if (completed) {
      unmarkComplete.mutate(
        { id: habitId, date: ts },
        { onSettled: () => setPendingKey(null) }
      );
    } else {
      markComplete.mutate(
        { id: habitId, date: ts },
        { onSettled: () => setPendingKey(null) }
      );
    }
  };

  const isCurrentOrFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div className="pt-4 pb-2 px-1 animate-fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-display font-semibold text-sm text-foreground">
          {getMonthName(viewYear, viewMonth)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={isCurrentOrFutureMonth && viewYear === today.getFullYear() && viewMonth === today.getMonth()}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-semibold text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const completed = isDayCompleted(day.dateKey, executions);
              const isPending = pendingKey === day.dateKey;
              const isInteractive = day.isCurrentMonth && !day.isFuture;
              const isOutside = !day.isCurrentMonth;

              return (
                <button
                  key={day.dateKey}
                  onClick={() => handleDayClick(day.dateKey, day.date, day.isFuture || isOutside)}
                  disabled={!isInteractive || isPending}
                  className={[
                    'relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all',
                    isOutside
                      ? 'opacity-0 pointer-events-none'
                      : day.isFuture
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : completed
                      ? 'bg-accent text-accent-foreground shadow-xs hover:bg-accent/85 cursor-pointer'
                      : day.isToday
                      ? 'ring-2 ring-accent/50 text-foreground hover:bg-secondary cursor-pointer'
                      : 'text-foreground hover:bg-secondary cursor-pointer',
                  ].join(' ')}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      {day.dayNumber}
                      {day.isToday && !completed && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm ring-2 ring-accent/50" />
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
