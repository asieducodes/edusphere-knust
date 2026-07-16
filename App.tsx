/**
 * EduSphere — App.tsx (project root)
 * -----------------------------------------------------------------------
 * Entry point. Wraps the app in SafeAreaProvider (required by all screens
 * using react-native-safe-area-context), AuthProvider (the placeholder
 * auth state RootNavigator reads to decide Auth vs Main), and
 * NavigationContainer (required by React Navigation), then renders
 * RootNavigator.
 * -----------------------------------------------------------------------
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
