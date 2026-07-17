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

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

const AppContent: React.FC = () => {
  const { isDark, colors } = useTheme();

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
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
