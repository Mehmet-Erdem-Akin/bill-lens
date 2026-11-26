import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
export const auth = getAuth();

export type FirestorePlatform =
  | 'Trendyol'
  | 'Yemeksepeti'
  | 'Getir'
  | 'AmazonTR'
  | 'Hepsiburada'
  | 'Unknown';

export const toFirestorePlatform = (platform: string): FirestorePlatform => {
  switch (platform) {
    case 'Trendyol':
      return 'Trendyol';
    case 'Yemeksepeti':
      return 'Yemeksepeti';
    case 'Getir':
      return 'Getir';
    case 'Amazon TR':
      return 'AmazonTR';
    case 'Hepsiburada':
      return 'Hepsiburada';
    default:
      return 'Unknown';
  }
};

export const createInboundAlias = (email: string): string => {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9.]/g, '') || 'user';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `alisveris+${local.toLowerCase()}.${suffix}@harcamam.app`;
};

export type UserDoc = {
  email: string;
  authProvider: 'apple' | 'email';
  inboundAlias: string;
  monthlyBudgetLimit: number;
  budgetEnabled: boolean;
  createdAt: ReturnType<typeof FieldValue.serverTimestamp> | Date;
};

export const ensureUserProfile = async (
  uid: string,
  email: string,
  authProvider: 'apple' | 'email' = 'email',
) => {
  const userRef = db.collection('users').doc(uid);
  const existing = await userRef.get();
  if (existing.exists) {
    return { id: uid, ...existing.data() } as UserDoc & { id: string };
  }

  let inboundAlias = createInboundAlias(email);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const aliasRef = db.collection('inboundAliases').doc(inboundAlias);
    const aliasDoc = await aliasRef.get();
    if (!aliasDoc.exists) break;
    inboundAlias = createInboundAlias(email);
  }

  const profile: UserDoc = {
    email: email.toLowerCase(),
    authProvider,
    inboundAlias,
    monthlyBudgetLimit: 15000,
    budgetEnabled: true,
    createdAt: FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(userRef, profile);
  batch.set(db.collection('inboundAliases').doc(inboundAlias), {
    userId: uid,
    email: profile.email,
  });
  batch.set(userRef.collection('connectedAccounts').doc('inbound'), {
    provider: 'inbound',
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return { id: uid, ...profile };
};

export const deleteUserData = async (uid: string) => {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    await auth.deleteUser(uid).catch(() => undefined);
    return;
  }

  const data = userSnap.data() as UserDoc;
  const batch = db.batch();

  const [accounts, orders] = await Promise.all([
    userRef.collection('connectedAccounts').listDocuments(),
    userRef.collection('orders').listDocuments(),
  ]);
  accounts.forEach((doc) => batch.delete(doc));
  orders.forEach((doc) => batch.delete(doc));

  if (data.inboundAlias) {
    batch.delete(db.collection('inboundAliases').doc(data.inboundAlias));
  }
  batch.delete(userRef);
  await batch.commit();
  await auth.deleteUser(uid).catch(() => undefined);
};
