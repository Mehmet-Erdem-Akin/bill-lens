import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import {
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoUser } from '../data/demoData';
import { updateUserBudget } from '../services/api';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';
import { fetchOrCreateUserProfile } from '../services/userProfile';
import type { UserProfile } from '../types';

type AuthState = {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  user: UserProfile | null;
  hydrateDone: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithApple: () => Promise<{ ok: boolean; error?: string }>;
  enterDemoMode: () => void;
  logout: () => Promise<void>;
  updateBudget: (limit: number, enabled: boolean) => void;
  setHydrateDone: (value: boolean) => void;
};

const createLocalInboundAlias = (email: string): string => {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9.]/g, '') || 'user';
  return `alisveris+${local.toLowerCase()}@harcamam.app`;
};

const localEmailProfile = (email: string): UserProfile => ({
  id: `user-${Date.now()}`,
  name: email.split('@')[0] || 'Kullanıcı',
  email: email.trim().toLowerCase(),
  authProvider: 'email',
  inboundAlias: createLocalInboundAlias(email),
  monthlyBudgetLimit: 15000,
  budgetEnabled: true,
});

const localAppleProfile = (): UserProfile => ({
  id: `apple-${Date.now()}`,
  name: 'Apple Kullanıcı',
  email: 'apple.user@privaterelay.appleid.com',
  authProvider: 'apple',
  inboundAlias: createLocalInboundAlias('apple.user'),
  monthlyBudgetLimit: 15000,
  budgetEnabled: true,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isDemoMode: false,
      user: null,
      hydrateDone: false,
      setHydrateDone: (value) => set({ hydrateDone: value }),
      loginWithEmail: async (email, password) => {
        if (!email.trim() || !password.trim()) {
          return { ok: false, error: 'E-posta ve şifre gerekli.' };
        }

        if (!isFirebaseConfigured()) {
          set({
            isAuthenticated: true,
            isDemoMode: false,
            user: localEmailProfile(email),
          });
          return { ok: true };
        }

        try {
          const auth = getFirebaseAuth();
          const normalized = email.trim().toLowerCase();
          let credential;
          try {
            credential = await signInWithEmailAndPassword(auth, normalized, password);
          } catch (error: unknown) {
            const code = (error as { code?: string })?.code;
            if (code === 'auth/invalid-email') {
              return { ok: false, error: 'Geçersiz e-posta adresi.' };
            }
            if (
              code === 'auth/user-not-found' ||
              code === 'auth/invalid-credential' ||
              code === 'auth/wrong-password'
            ) {
              try {
                credential = await createUserWithEmailAndPassword(
                  auth,
                  normalized,
                  password,
                );
                await updateProfile(credential.user, {
                  displayName: normalized.split('@')[0] || 'Kullanıcı',
                });
              } catch (createError: unknown) {
                const createCode = (createError as { code?: string })?.code;
                if (
                  createCode === 'auth/email-already-in-use' ||
                  createCode === 'auth/invalid-credential'
                ) {
                  return { ok: false, error: 'E-posta veya şifre hatalı.' };
                }
                throw createError;
              }
            } else {
              throw error;
            }
          }

          const profile = await fetchOrCreateUserProfile(
            credential.user.uid,
            credential.user.email || normalized,
            'email',
            credential.user.displayName,
          );
          set({ isAuthenticated: true, isDemoMode: false, user: profile });
          return { ok: true };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Giriş başarısız. Firebase ayarlarını kontrol edin.';
          return { ok: false, error: message };
        }
      },
      loginWithApple: async () => {
        if (!isFirebaseConfigured()) {
          set({
            isAuthenticated: true,
            isDemoMode: false,
            user: localAppleProfile(),
          });
          return { ok: true };
        }

        try {
          const auth = getFirebaseAuth();
          let idToken: string | undefined;
          let rawNonce: string | undefined;
          let fullName: string | undefined;

          if (Platform.OS === 'ios') {
            rawNonce = Crypto.randomUUID().replace(/-/g, '');
            const hashedNonce = await Crypto.digestStringAsync(
              Crypto.CryptoDigestAlgorithm.SHA256,
              rawNonce,
            );
            const apple = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
              nonce: hashedNonce,
            });
            idToken = apple.identityToken ?? undefined;
            fullName = [apple.fullName?.givenName, apple.fullName?.familyName]
              .filter(Boolean)
              .join(' ');
          }

          if (!idToken || !rawNonce) {
            // Simulator / cancel fallback for local development
            set({
              isAuthenticated: true,
              isDemoMode: false,
              user: localAppleProfile(),
            });
            return { ok: true };
          }

          const provider = new OAuthProvider('apple.com');
          const credential = provider.credential({
            idToken,
            rawNonce,
          });
          const result = await signInWithCredential(auth, credential);
          const email =
            result.user.email || `${result.user.uid}@privaterelay.appleid.com`;
          if (fullName) {
            await updateProfile(result.user, { displayName: fullName }).catch(() => undefined);
          }
          const profile = await fetchOrCreateUserProfile(
            result.user.uid,
            email,
            'apple',
            fullName || result.user.displayName,
          );
          set({ isAuthenticated: true, isDemoMode: false, user: profile });
          return { ok: true };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Apple ile giriş başarısız.';
          return { ok: false, error: message };
        }
      },
      enterDemoMode: () => {
        set({
          isAuthenticated: true,
          isDemoMode: true,
          user: { ...demoUser },
        });
      },
      logout: async () => {
        if (isFirebaseConfigured() && !get().isDemoMode) {
          try {
            await signOut(getFirebaseAuth());
          } catch {
            // ignore
          }
        }
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

        const { isDemoMode, user } = get();
        if (!isDemoMode && user && isFirebaseConfigured()) {
          void updateUserBudget(limit, enabled).catch(() => undefined);
        }
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
