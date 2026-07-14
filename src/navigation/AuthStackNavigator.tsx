/**
 * EduSphere — navigation/AuthStackNavigator.tsx
 * -----------------------------------------------------------------------
 * Everything the student sees before they're authenticated + verified:
 * Splash, Login, Signup, Forgot Password, Email Verification. Rendered
 * by RootNavigator whenever `isAuthenticated && isEmailVerified` is false
 * (see context/AuthContext.tsx).
 * -----------------------------------------------------------------------
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import EmailVerificationScreen from "../screens/EmailVerificationScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
