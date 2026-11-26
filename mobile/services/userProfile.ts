import { doc, getDoc } from 'firebase/firestore';

import type { AuthProvider, UserProfile } from '../types';
import { registerUserProfile, type RemoteUserProfile } from './api';
import { getFirebaseDb } from './firebase';

const toProfile = (
  remote: RemoteUserProfile,
  nameFallback: string,
): UserProfile => ({
  id: remote.id,
  name: nameFallback || remote.email.split('@')[0] || 'Kullanıcı',
  email: remote.email,
  authProvider: remote.authProvider,
  inboundAlias: remote.inboundAlias,
  monthlyBudgetLimit: Number(remote.monthlyBudgetLimit ?? 15000),
  budgetEnabled: remote.budgetEnabled ?? true,
});

export const fetchOrCreateUserProfile = async (
  uid: string,
  email: string,
  authProvider: Exclude<AuthProvider, 'demo'>,
  displayName?: string | null,
): Promise<UserProfile> => {
  const nameFallback = displayName || email.split('@')[0] || 'Kullanıcı';

  try {
    const snap = await getDoc(doc(getFirebaseDb(), 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return toProfile(
        {
          id: uid,
          email: String(data.email || email),
          authProvider: (data.authProvider as 'apple' | 'email') || authProvider,
          inboundAlias: String(data.inboundAlias || ''),
          monthlyBudgetLimit: Number(data.monthlyBudgetLimit ?? 15000),
          budgetEnabled: Boolean(data.budgetEnabled ?? true),
        },
        nameFallback,
      );
    }
  } catch {
    // Fall through to API register (works when Firestore rules / offline)
  }

  const remote = await registerUserProfile(email, authProvider);
  return toProfile({ ...remote, id: remote.id || uid }, nameFallback);
};
