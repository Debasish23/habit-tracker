import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateHabit } from '@/hooks/useQueries';

export function AddHabitForm() {
  const [name, setName] = useState('');
  const createHabit = useCreateHabit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    createHabit.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setName('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="text"
        placeholder="Add a new habit..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        className="flex-1 h-11 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-accent/50 focus-visible:border-accent"
        disabled={createHabit.isPending}
      />
      <Button
        type="submit"
        disabled={!name.trim() || createHabit.isPending}
        className="h-11 px-5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-display font-semibold gap-2 shadow-xs transition-all"
      >
        {createHabit.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Add Habit
      </Button>
    </form>
  );
}
