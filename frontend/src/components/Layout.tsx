import { Heart, LogOut, Loader2, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '../backend';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  userProfile?: UserProfile | null;
}

export function Layout({ children, userProfile }: LayoutProps) {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'habit-tracker'
  );
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await clear();
      queryClient.clear();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <img
            src="/assets/generated/habit-logo.dim_128x128.png"
            alt="Habit Tracker logo"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">
              Habit Tracker
            </h1>
            <p className="text-xs text-muted-foreground leading-none hidden sm:block">
              Build better habits, one day at a time
            </p>
          </div>

          {/* User info + logout */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {userProfile?.name && (
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-accent" />
                  </div>
                  <span className="font-medium text-foreground max-w-[120px] truncate">
                    {userProfile.name}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Log out"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="ml-1.5 text-xs hidden sm:inline">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} Habit Tracker</span>
          <span className="flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 fill-accent text-accent mx-0.5" />
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
