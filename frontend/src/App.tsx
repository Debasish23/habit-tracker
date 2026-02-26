import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { HabitsPage } from './pages/HabitsPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show a full-screen loader while we're determining auth state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Not logged in → show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Logged in but still loading profile → show spinner
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Profile setup modal (shown when profile is null after fetch)
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  return (
    <Layout userProfile={userProfile ?? null}>
      {showProfileSetup && <ProfileSetupModal open={true} />}
      <HabitsPage />
    </Layout>
  );
}

export default function App() {
  return <AppContent />;
}
