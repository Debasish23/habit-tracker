import { format } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from '@/components/ui/popover';

interface CompletedHabitsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  completedHabitNames: string[];
  children: React.ReactNode;
}

export function CompletedHabitsPopover({
  open,
  onOpenChange,
  date,
  completedHabitNames,
  children,
}: CompletedHabitsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 rounded-xl shadow-card border border-border"
        side="top"
        align="center"
        sideOffset={6}
      >
        {date && (
          <>
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-border bg-secondary/40 rounded-t-xl">
              <p className="text-xs font-semibold text-foreground">
                {format(date, 'EEEE, MMM d')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedHabitNames.length === 0
                  ? 'No habits completed'
                  : `${completedHabitNames.length} habit${completedHabitNames.length !== 1 ? 's' : ''} completed`}
              </p>
            </div>

            {/* Habit list */}
            <div className="px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
              {completedHabitNames.length === 0 ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <Circle className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs">Nothing logged yet</span>
                </div>
              ) : (
                completedHabitNames.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-xs text-foreground truncate" title={name}>
                      {name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
