/**
 * EduSphere — navigation/RootNavigator.tsx
 * -----------------------------------------------------------------------
 * Decides which of two entirely separate navigator trees to show:
 * AuthStackNavigator (Splash, Login, Signup, ForgotPassword,
 * EmailVerification) or MainStackNavigator (the tab bar + detail screens).
 *
 * This is the standard React Navigation pattern for auth flows: rather
 * than living inside one shared stack, Auth and Main are two whole trees,
 * and only one is ever mounted at a time. That's what makes "log in and
 * land on the tab bar" a two-step effect here rather than a single
 * navigation.navigate() call — see context/AuthContext.tsx for how
 * screens trigger the switch.
 * -----------------------------------------------------------------------
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AuthStackNavigator from "./AuthStackNavigator";
import MainStackNavigator from "./MainStackNavigator";

// This top-level switch doesn't need typed route params — each branch is
// a full component with no params of its own, and screens never navigate
// to "AuthStack" or "MainStack" by name (the auth state below decides
// which one is mounted, not a navigate() call).
const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isEmailVerified } = useAuth();

  // Only fully authenticated + verified students see the main app.
  // Everyone else — logged out, or logged in but still pending email
  // verification — sees AuthStack, which internally starts at Splash and
  // routes to the right screen (see SplashScreen.tsx).
  const showMainApp = isAuthenticated && isEmailVerified;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showMainApp ? (
        <Stack.Screen name="MainStack" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
