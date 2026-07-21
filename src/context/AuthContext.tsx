/**
 * EduSphere — context/AuthContext.tsx
 * -----------------------------------------------------------------------
 * Real, backend-backed auth state, shared between RootNavigator (which
 * decides AuthStack vs MainStack) and the auth screens (which call the
 * actions below on submit).
 *
 * WHY THIS EXISTS: once AuthStack and MainStack are separate navigator
 * trees, LoginScreen can't call `navigation.navigate('MainTabs')` directly
 * — MainTabs isn't part of AuthStack's tree. The fix is a shared piece of
 * state that RootNavigator watches; when it changes, RootNavigator
 * unmounts one tree and mounts the other.
 * -----------------------------------------------------------------------
 */

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { getToken } from '../services/tokenStorage';
import { setUnauthorizedHandler } from '../services/api';
import { registerForPushNotifications, unregisterPushNotifications } from '../services/pushNotifications';
import { User } from '../types/user';
import { LoginPayload, RegisterPayload } from '../types/auth';

interface AuthContextValue {
  /** True until the initial cold-start session check resolves — RootNavigator
   *  gates on this before deciding Auth vs Main stack. */
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  user: User | null;
  /** The email a student just signed up with, kept around only so
   *  SplashScreen/EmailVerificationScreen can show the right email if the
   *  app is reopened before verifying. */
  pendingEmail: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-checks the session against the server — used by
   *  EmailVerificationScreen (on screen focus) to detect that the student
   *  verified via the emailed link, without needing a manual "I've
   *  verified" button. */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const applyUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    setIsAuthenticated(true);
    setIsEmailVerified(nextUser.isEmailVerified);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsEmailVerified(false);
  }, []);

  // Session restore on cold start — a stored token doesn't mean it's
  // still valid, so this confirms it against the server before trusting it.
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const response = await authService.getMe();
          applyUser(response.data.user);
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [applyUser, clearSession]);

  // A 401 from any request (expired/invalid token) logs the user out and
  // lets RootNavigator swap back to AuthStack on its own.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Covers every path that flips isAuthenticated to true — login,
  // register-with-immediate-token, cold-start session restore, and
  // refreshSession — without duplicating the call at each of those sites.
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications().catch(() => undefined);
    }
  }, [isAuthenticated]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      applyUser(response.data.user);
    },
    [applyUser]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authService.register(payload);
      setPendingEmail(payload.email);
      // No session is issued until the email is confirmed (token is
      // optional) — don't flip isAuthenticated in that case. EmailVerification
      // is reachable directly via navigation, without being "authenticated".
      if (response.data.token) {
        applyUser(response.data.user);
      }
    },
    [applyUser]
  );

  const logout = useCallback(async () => {
    try {
      // Must run before authService.logout(), which clears the auth
      // token in its own finally block — after that, this DELETE call
      // would go out unauthenticated and fail.
      await unregisterPushNotifications().catch(() => undefined);
      await authService.logout();
    } finally {
      clearSession();
      setPendingEmail(null);
    }
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        clearSession();
        return;
      }
      const response = await authService.getMe();
      applyUser(response.data.user);
    } catch {
      clearSession();
    }
  }, [applyUser, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated,
      isEmailVerified,
      user,
      pendingEmail,
      login,
      register,
      logout,
      refreshSession,
    }),
    [isLoading, isAuthenticated, isEmailVerified, user, pendingEmail, login, register, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
