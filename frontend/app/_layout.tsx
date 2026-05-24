import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '@/context/AppContext';
import { AppColors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useApp();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppProvider>
          <AuthGuard />
          <Stack
          screenOptions={{
            contentStyle: { backgroundColor: AppColors.background },
            animation: 'fade',
            animationDuration: 200,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="message" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="story/create" options={{ headerShown: false }} />
          <Stack.Screen name="story/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="change-password" options={{ headerShown: false }} />
          <Stack.Screen name="change-password/verify" options={{ headerShown: false }} />
          <Stack.Screen name="blocked-accounts" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: false }} />
          <Stack.Screen name="privacy" options={{ headerShown: false }} />
          <Stack.Screen name="followers/[userId]" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="auth/email-verification" options={{ headerShown: false }} />
          <Stack.Screen name="auth/onboarding-fullname" options={{ headerShown: false }} />
          <Stack.Screen name="auth/onboarding-username" options={{ headerShown: false }} />
          <Stack.Screen name="auth/onboarding-avatar-bio" options={{ headerShown: false }} />
          <Stack.Screen name="auth/onboarding-find-friends" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="admin/users" options={{ headerShown: false }} />
          <Stack.Screen name="admin/reports" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </AppProvider>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
