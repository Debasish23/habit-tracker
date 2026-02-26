import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { HabitView } from '@/backend';
import {
  aggregateMonthlyCompletions,
  formatMonthYear,
  getHabitsCompletedOnDate,
  getDaysOfMonth,
} from '@/utils/chartHelpers';
import { CompletedHabitsPopover } from './CompletedHabitsPopover';

interface MonthlyHabitsChartProps {
  habits: Array<[bigint, HabitView]>;
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const chartConfig = {
  count: {
    label: 'Habits Completed',
    color: 'oklch(var(--chart-1))',
  },
};

interface PopoverState {
  open: boolean;
  day: number | null;
  date: Date | null;
  completedNames: string[];
}

// Custom bar shape that forwards a click ref for popover anchoring
function ClickableBar(props: any) {
  const { x, y, width, height, onClick, fill, opacity } = props;
  if (!height || height <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      opacity={opacity ?? 1}
      rx={4}
      ry={4}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    />
  );
}

export function MonthlyHabitsChart({
  habits,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: MonthlyHabitsChartProps) {
  const data = aggregateMonthlyCompletions(habits, year, month);
  const totalHabits = habits.length;
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const today = now.getDate();

  const [popover, setPopover] = useState<PopoverState>({
    open: false,
    day: null,
    date: null,
    completedNames: [],
  });

  // We use a wrapper div + a positioned anchor div for the popover
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [anchorStyle, setAnchorStyle] = useState<React.CSSProperties>({});

  const handleBarClick = (entry: { day: number; count: number; label: string }, barX: number) => {
    const days = getDaysOfMonth(year, month);
    const dayData = days.find(d => d.day === entry.day);
    if (!dayData) return;

    const completedNames = getHabitsCompletedOnDate(dayData.dateKey, habits);
    const date = new Date(year, month, entry.day);

    // Toggle if same day clicked again
    if (popover.open && popover.day === entry.day) {
      setPopover(prev => ({ ...prev, open: false }));
      return;
    }

    // Position anchor relative to chart wrapper
    if (chartWrapperRef.current) {
      const wrapperRect = chartWrapperRef.current.getBoundingClientRect();
      setAnchorStyle({
        position: 'absolute',
        left: barX,
        top: 0,
        width: 1,
        height: '100%',
        pointerEvents: 'none',
      });
    }

    setPopover({ open: true, day: entry.day, date, completedNames });
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-base text-foreground">
            Monthly Overview
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily habit completions — {formatMonthYear(year, month)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onNextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart with popover anchor */}
      <div ref={chartWrapperRef} className="relative h-48 w-full">
        {/* Popover anchor positioned absolutely inside chart wrapper */}
        <CompletedHabitsPopover
          open={popover.open}
          onOpenChange={(open) => setPopover(prev => ({ ...prev, open }))}
          date={popover.date}
          completedHabitNames={popover.completedNames}
        >
          <div style={anchorStyle} />
        </CompletedHabitsPopover>

        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="oklch(var(--border))"
              opacity={0.6}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'oklch(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval={data.length > 20 ? 4 : data.length > 14 ? 2 : 1}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, Math.max(totalHabits, maxCount, 1)]}
              tick={{ fontSize: 10, fill: 'oklch(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              shape={(shapeProps: any) => {
                const entry = shapeProps.count !== undefined
                  ? shapeProps
                  : data[shapeProps.index];
                const isToday = isCurrentMonth && entry.day === today;
                const isFuture = isCurrentMonth && entry.day > today;
                const opacity = isFuture ? 0.25 : 1;
                const fill = isToday
                  ? 'oklch(var(--chart-2))'
                  : entry.count === 0
                  ? 'oklch(var(--muted))'
                  : 'oklch(var(--chart-1))';
                return (
                  <ClickableBar
                    {...shapeProps}
                    fill={fill}
                    opacity={opacity}
                    onClick={() => handleBarClick(entry, shapeProps.x + shapeProps.width / 2)}
                  />
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-chart-1 inline-block" />
          Completed
        </span>
        {isCurrentMonth && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-chart-2 inline-block" />
            Today
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-muted inline-block" />
          None
        </span>
        <span className="flex items-center gap-1.5 ml-auto text-muted-foreground/70">
          Click a bar for details
        </span>
      </div>
    </div>
  );
}
