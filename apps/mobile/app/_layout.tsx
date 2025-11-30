import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessionProvider, useSession } from '@/ctx';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { session, apiUrl, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inConfigure = segments[0] === 'configure';

    // 1. If no Server URL is configured, go to configuration screen
    if (!apiUrl && !inConfigure) {
      router.replace('/configure');
    }
    // 2. If Server URL is set but no session, go to login
    else if (apiUrl && !session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // 3. If logged in and trying to access auth/configure, go to main app
    else if (apiUrl && session && (inAuthGroup || inConfigure)) {
      router.replace('/(tabs)');
    }
  }, [session, apiUrl, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="configure" options={{ title: 'Server Setup', headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}
