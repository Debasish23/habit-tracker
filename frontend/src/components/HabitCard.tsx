import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader2, Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { HabitId, HabitView } from '@/backend';
import { HabitCalendar } from './HabitCalendar';
import { computeStreak, isCompleted, todayAsBackend } from '@/utils/dateHelpers';
import { useMarkComplete, useUnmarkComplete, useDeleteHabit } from '@/hooks/useQueries';

interface HabitCardProps {
  habitId: HabitId;
  habit: HabitView;
}

export function HabitCard({ habitId, habit }: HabitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const markComplete = useMarkComplete();
  const unmarkComplete = useUnmarkComplete();
  const deleteHabit = useDeleteHabit();

  const streak = computeStreak(habit.executions);
  const todayTs = todayAsBackend();
  const completedToday = isCompleted(todayTs, habit.executions);

  const handleToggleToday = () => {
    if (completedToday) {
      unmarkComplete.mutate({ id: habitId, date: todayTs });
    } else {
      markComplete.mutate({ id: habitId, date: todayTs });
    }
  };

  const isTogglePending = markComplete.isPending || unmarkComplete.isPending;
  const isDeletePending = deleteHabit.isPending;

  return (
    <div
      className={[
        'bg-card rounded-2xl shadow-card border border-border transition-all duration-200',
        expanded ? 'shadow-card-hover' : 'hover:shadow-card-hover',
        'animate-fade-in',
      ].join(' ')}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 p-4">
        {/* Today toggle */}
        <button
          onClick={handleToggleToday}
          disabled={isTogglePending}
          aria-label={completedToday ? 'Mark incomplete' : 'Mark complete for today'}
          className={[
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border-2',
            completedToday
              ? 'bg-accent border-accent text-accent-foreground shadow-xs'
              : 'border-border bg-background text-muted-foreground hover:border-accent/60 hover:bg-accent/10',
          ].join(' ')}
        >
          {isTogglePending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : completedToday ? (
            <Check className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <div className="w-3 h-3 rounded-sm border-2 border-current" />
          )}
        </button>

        {/* Habit info */}
        <div className="flex-1 min-w-0">
          <h3
            className={[
              'font-display font-semibold text-base leading-tight truncate transition-colors',
              completedToday ? 'text-muted-foreground line-through' : 'text-foreground',
            ].join(' ')}
          >
            {habit.name}
          </h3>
          {streak > 0 ? (
            <div className="flex items-center gap-1 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold text-accent">
                {streak} day{streak !== 1 ? 's' : ''} streak
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground mt-0.5 block">
              Start your streak today!
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Expand calendar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label={expanded ? 'Hide calendar' : 'Show calendar'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeletePending}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Delete habit"
              >
                {isDeletePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Delete habit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>"{habit.name}"</strong> and all its
                  completion history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteHabit.mutate({ id: habitId })}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Calendar (expanded) */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <HabitCalendar habitId={habitId} executions={habit.executions} />
        </div>
      )}
    </div>
  );
}
