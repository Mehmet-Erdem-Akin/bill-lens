import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';
import { tokens } from '@/theme/tokens';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <RootNavigator />
    </QueryClientProvider>
  );
}

const RootNavigator = () => {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateDone = useAuthStore((s) => s.hydrateDone);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Persist rehydrate may already be done if storage is sync-empty
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().setHydrateDone(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.getState().setHydrateDone(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrateDone) return;
    setReady(true);

    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [hydrateDone, isAuthenticated, segments, router]);

  if (!ready && !hydrateDone) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokens.colors.background },
      }}
    >
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};
