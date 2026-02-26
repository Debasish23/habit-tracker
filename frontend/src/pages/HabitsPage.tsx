import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AddHabitForm } from '@/components/AddHabitForm';
import { HabitCard } from '@/components/HabitCard';
import { MonthlyHabitsChart } from '@/components/MonthlyHabitsChart';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetHabits } from '@/hooks/useQueries';
import { computeStreak } from '@/utils/dateHelpers';

function HabitCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function HabitsPage() {
  const { data: habits, isLoading, isError } = useGetHabits();

  const now = new Date();
  const [chartYear, setChartYear] = useState(now.getFullYear());
  const [chartMonth, setChartMonth] = useState(now.getMonth());

  const sortedHabits = habits
    ? [...habits].sort((a, b) => {
        return Number(b[1].created) - Number(a[1].created);
      })
    : [];

  // Compute best streak with habit name
  const bestStreakInfo = sortedHabits.reduce<{ streak: number; name: string }>(
    (best, [, habit]) => {
      const streak = computeStreak(habit.executions);
      return streak > best.streak ? { streak, name: habit.name } : best;
    },
    { streak: 0, name: '' }
  );

  // Count done today
  const doneTodayCount = sortedHabits.filter(([, h]) => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return h.executions.some(e => {
      const d = new Date(Number(e) * 1000);
      const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      return k === todayKey;
    });
  }).length;

  function handlePrevMonth() {
    if (chartMonth === 0) {
      setChartMonth(11);
      setChartYear(y => y - 1);
    } else {
      setChartMonth(m => m - 1);
    }
  }

  function handleNextMonth() {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    if (chartYear < currentYear || (chartYear === currentYear && chartMonth < currentMonth)) {
      if (chartMonth === 11) {
        setChartMonth(0);
        setChartYear(y => y + 1);
      } else {
        setChartMonth(m => m + 1);
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Page intro */}
      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-1">
          My Habits
        </h2>
        <p className="text-muted-foreground text-sm">
          Track your daily habits and build lasting streaks.
        </p>
      </div>

      {/* Add habit form */}
      <AddHabitForm />

      {/* Habits list */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <HabitCardSkeleton />
            <HabitCardSkeleton />
            <HabitCardSkeleton />
          </>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Failed to load habits. Please try again.</p>
          </div>
        ) : sortedHabits.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">No habits yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first habit above to get started!
              </p>
            </div>
          </div>
        ) : (
          sortedHabits.map(([id, habit]) => (
            <HabitCard key={id.toString()} habitId={id} habit={habit} />
          ))
        )}
      </div>

      {/* Stats summary */}
      {sortedHabits.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <StatCard
              label="Total Habits"
              value={sortedHabits.length.toString()}
            />
            <StatCard
              label="Done Today"
              value={doneTodayCount.toString()}
            />
            <div className={[
              'bg-card rounded-xl border border-border p-4 shadow-xs col-span-2 sm:col-span-1'
            ].join(' ')}>
              <p className="text-xs text-muted-foreground font-medium mb-1">Best Streak</p>
              <p className="font-display font-bold text-xl text-foreground">
                🔥 {bestStreakInfo.streak} days
              </p>
              {bestStreakInfo.name && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate" title={bestStreakInfo.name}>
                  {bestStreakInfo.name}
                </p>
              )}
            </div>
          </div>

          {/* Monthly chart */}
          <MonthlyHabitsChart
            habits={sortedHabits}
            year={chartYear}
            month={chartMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={['bg-card rounded-xl border border-border p-4 shadow-xs', className].filter(Boolean).join(' ')}>
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p className="font-display font-bold text-xl text-foreground">{value}</p>
    </div>
  );
}
