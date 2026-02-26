import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Sparkles, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <img
            src="/assets/generated/habit-logo.dim_128x128.png"
            alt="Habit Tracker logo"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <h1 className="font-display font-bold text-lg text-foreground">Habit Tracker</h1>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Logo + branding */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-card">
              <img
                src="/assets/generated/habit-logo.dim_128x128.png"
                alt="Habit Tracker"
                className="w-14 h-14 rounded-2xl object-cover"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
                Build Better Habits
              </h2>
              <p className="text-muted-foreground mt-2 text-base">
                Track your daily habits, build streaks, and grow — one day at a time.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-3 text-left">
            {[
              { icon: CheckCircle2, text: 'Track daily habits with a simple tap' },
              { icon: TrendingUp, text: 'Visualize your progress with monthly charts' },
              { icon: Calendar, text: 'Build streaks and stay consistent' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-foreground font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold rounded-xl"
              onClick={() => login()}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started — Sign In
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Secure, private login. Your habits are yours alone.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5">
        <div className="max-w-2xl mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Habit Tracker · Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'habit-tracker')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
