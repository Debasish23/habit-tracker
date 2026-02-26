import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { HabitId, HabitView, UserProfile } from '../backend';
import { todayAsBackend } from '../utils/dateHelpers';

const HABITS_KEY = ['habits'];
const CURRENT_USER_PROFILE_KEY = ['currentUserProfile'];

// ─── Habit Queries ────────────────────────────────────────────────────────────

export function useGetHabits() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[HabitId, HabitView]>>({
    queryKey: HABITS_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      const created = todayAsBackend();
      return actor.createHabit(name, created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: HabitId }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteHabit(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useMarkComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: HabitId; date: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.markComplete(id, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

export function useUnmarkComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: HabitId; date: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.unmarkComplete(id, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
    },
  });
}

// ─── User Profile Queries ─────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: CURRENT_USER_PROFILE_KEY,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_PROFILE_KEY });
    },
  });
}
