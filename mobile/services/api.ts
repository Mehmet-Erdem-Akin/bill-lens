import { getFirebaseAuth, getFunctionsBaseUrl } from './firebase';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

const getIdToken = async (explicit?: string): Promise<string | undefined> => {
  if (explicit) return explicit;
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return undefined;
    return user.getIdToken();
  } catch {
    return undefined;
  }
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = await getIdToken(options.token);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = getFunctionsBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${base}${normalizedPath}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export type RemoteUserProfile = {
  id: string;
  email: string;
  authProvider: 'apple' | 'email';
  inboundAlias: string;
  monthlyBudgetLimit: number;
  budgetEnabled?: boolean;
};

export const registerUserProfile = async (
  email: string,
  authProvider: 'apple' | 'email',
) =>
  apiRequest<RemoteUserProfile>('/auth/register', {
    method: 'POST',
    body: { email, authProvider },
  });

export const updateUserBudget = async (
  monthlyBudgetLimit: number,
  budgetEnabled?: boolean,
) =>
  apiRequest<RemoteUserProfile>('/user/budget', {
    method: 'PATCH',
    body: { monthlyBudgetLimit, budgetEnabled },
  });

export const deleteUserAccount = async (token?: string) =>
  apiRequest<void>('/user/account', { method: 'DELETE', token });
