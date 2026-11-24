import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GMAIL_TOKEN_KEY = 'billlens.gmail.token';
const OUTLOOK_TOKEN_KEY = 'billlens.outlook.token';

export const getRedirectUri = () =>
  AuthSession.makeRedirectUri({ scheme: 'billlens' });

/**
 * Phase 2 stubs — wire client IDs via env before production OAuth.
 * On-device parsing keeps raw mail off the server (CASA exemption path).
 */
export const connectGmail = async (): Promise<{ email: string } | null> => {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    // Demo fallback for review / local builds without OAuth secrets
    await SecureStore.setItemAsync(GMAIL_TOKEN_KEY, 'demo-gmail-token');
    return { email: 'erdemakin@gmail.com' };
  }

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri: getRedirectUri(),
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'email'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  const result = await request.promptAsync(discovery);
  if (result.type !== 'success') return null;

  await SecureStore.setItemAsync(
    GMAIL_TOKEN_KEY,
    result.authentication?.accessToken ?? result.params.code ?? '',
  );
  return { email: 'connected@gmail.com' };
};

export const connectOutlook = async (): Promise<{ email: string } | null> => {
  const clientId = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
  if (!clientId) {
    await SecureStore.setItemAsync(OUTLOOK_TOKEN_KEY, 'demo-outlook-token');
    return { email: 'erdemakin@outlook.com' };
  }

  const discovery = {
    authorizationEndpoint:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  };

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri: getRedirectUri(),
    scopes: ['Mail.Read', 'offline_access', 'User.Read'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  const result = await request.promptAsync(discovery);
  if (result.type !== 'success') return null;

  await SecureStore.setItemAsync(
    OUTLOOK_TOKEN_KEY,
    result.authentication?.accessToken ?? result.params.code ?? '',
  );
  return { email: 'connected@outlook.com' };
};

export const clearOAuthTokens = async () => {
  await SecureStore.deleteItemAsync(GMAIL_TOKEN_KEY);
  await SecureStore.deleteItemAsync(OUTLOOK_TOKEN_KEY);
};

export const clearProviderToken = async (provider: 'gmail' | 'outlook') => {
  const key = provider === 'gmail' ? GMAIL_TOKEN_KEY : OUTLOOK_TOKEN_KEY;
  await SecureStore.deleteItemAsync(key);
};

export const getStoredToken = async (provider: 'gmail' | 'outlook') => {
  const key = provider === 'gmail' ? GMAIL_TOKEN_KEY : OUTLOOK_TOKEN_KEY;
  return SecureStore.getItemAsync(key);
};
