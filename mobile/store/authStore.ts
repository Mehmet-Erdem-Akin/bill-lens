import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoUser } from '../data/demoData';
import type { AuthProvider, UserProfile } from '../types';

type AuthState = {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  user: UserProfile | null;
  hydrateDone: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithApple: () => Promise<{ ok: boolean; error?: string }>;
  enterDemoMode: () => void;
  logout: () => void;
  updateBudget: (limit: number, enabled: boolean) => void;
  setHydrateDone: (value: boolean) => void;
};

const createInboundAlias = (email: string): string => {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9.]/g, '') || 'user';
  return `alisveris+${local.toLowerCase()}@harcamam.app`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isDemoMode: false,
      user: null,
      hydrateDone: false,
      setHydrateDone: (value) => set({ hydrateDone: value }),
      loginWithEmail: async (email, password) => {
        if (!email.trim() || !password.trim()) {
          return { ok: false, error: 'E-posta ve şifre gerekli.' };
        }

        const profile: UserProfile = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0] || 'Kullanıcı',
          email: email.trim().toLowerCase(),
          authProvider: 'email',
          inboundAlias: createInboundAlias(email),
          monthlyBudgetLimit: 15000,
          budgetEnabled: true,
        };

        set({ isAuthenticated: true, isDemoMode: false, user: profile });
        return { ok: true };
      },
      loginWithApple: async () => {
        const profile: UserProfile = {
          id: `apple-${Date.now()}`,
          name: 'Apple Kullanıcı',
          email: 'apple.user@privaterelay.appleid.com',
          authProvider: 'apple' as AuthProvider,
          inboundAlias: createInboundAlias('apple.user'),
          monthlyBudgetLimit: 15000,
          budgetEnabled: true,
        };
        set({ isAuthenticated: true, isDemoMode: false, user: profile });
        return { ok: true };
      },
      enterDemoMode: () => {
        set({
          isAuthenticated: true,
          isDemoMode: true,
          user: { ...demoUser },
        });
      },
      logout: () => {
        set({ isAuthenticated: false, isDemoMode: false, user: null });
      },
      updateBudget: (limit, enabled) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              monthlyBudgetLimit: limit,
              budgetEnabled: enabled,
            },
          };
        });
      },
    }),
    {
      name: 'bill-lens-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrateDone(true);
      },
    },
  ),
);
