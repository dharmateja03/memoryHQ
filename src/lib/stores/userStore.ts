import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CognitiveProfile, Streak } from '@/types';

interface UserState {
  user: User | null;
  profile: CognitiveProfile | null;
  streak: Streak | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: CognitiveProfile | null) => void;
  setStreak: (streak: Streak | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateProfile: (updates: Partial<CognitiveProfile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      streak: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setStreak: (streak) => set({ streak }),
      setLoading: (isLoading) => set({ isLoading }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
      logout: () => set({ user: null, profile: null, streak: null }),
    }),
    {
      name: 'mindforge-user',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        streak: state.streak,
      }),
    }
  )
);
