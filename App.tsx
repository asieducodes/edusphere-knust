/**
 * EduSphere — App.tsx (project root)
 * -----------------------------------------------------------------------
 * Entry point. Wraps the app in SafeAreaProvider (required by all screens
 * using react-native-safe-area-context), ThemeProvider + LanguageProvider
 * (Light/Dark/System and English/Français/Español — see SettingsScreen),
 * AuthProvider (real backend-backed auth state RootNavigator reads to
 * decide Auth vs Main), and NavigationContainer (required by React
 * Navigation), then renders RootNavigator.
 * -----------------------------------------------------------------------
 */

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { queryClient } from './src/lib/queryClient';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/navigation/types';

// Module-level so the notification-tap listener (set up outside any
// screen's render) can navigate without needing a prop-drilled reference.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AppContent: React.FC = () => {
  const { isDark, colors } = useTheme();

  // Tapping a system notification opens the Notifications list — not a
  // deep link to the specific target, since the push payload only carries
  // { type, ...data } (not a full AppNotification), and Notifications is
  // always a safe destination regardless of what triggered the push. Only
  // fires if MainStack is actually mounted (navigationRef.isReady()) —
  // e.g. not while still on the auth stack.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Notifications');
      }
    });
    return () => subscription.remove();
  }, []);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
