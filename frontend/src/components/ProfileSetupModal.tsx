import { useState } from 'react';
import { Loader2, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '@/hooks/useQueries';

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveProfile.mutate({ name: trimmed });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-sm rounded-2xl"
        // Prevent closing by clicking outside or pressing Escape
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center gap-3 pb-2">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
            <User className="w-7 h-7 text-accent" />
          </div>
          <div>
            <DialogTitle className="font-display font-bold text-xl">
              Welcome! What's your name?
            </DialogTitle>
            <DialogDescription className="text-sm mt-1">
              This is how you'll appear in your habit tracker.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Your name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={60}
              disabled={saveProfile.isPending}
              className="rounded-xl"
            />
          </div>

          {saveProfile.isError && (
            <p className="text-xs text-destructive">
              Something went wrong. Please try again.
            </p>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={!name.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
