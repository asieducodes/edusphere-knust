/**
 * EduSphere — context/AuthContext.tsx
 * -----------------------------------------------------------------------
 * Placeholder auth state, shared between RootNavigator (which decides
 * AuthStack vs MainStack) and the auth screens (which need to flip that
 * state after a successful login/signup).
 *
 * WHY THIS EXISTS: once AuthStack and MainStack are separate navigator
 * trees, LoginScreen can't call `navigation.navigate('MainTabs')` directly
 * — MainTabs isn't part of AuthStack's tree. The standard fix is exactly
 * this: a shared piece of state that RootNavigator watches. When it
 * changes, RootNavigator unmounts one tree and mounts the other.
 *
 * REPLACING WITH SUPABASE LATER: swap the useState calls below for a
 * real session listener, e.g.:
 *   useEffect(() => {
 *     const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
 *       setIsAuthenticated(!!session);
 *       setIsEmailVerified(!!session?.user?.email_confirmed_at);
 *     });
 *     return () => sub.subscription.unsubscribe();
 *   }, []);
 * At that point `login()`, `completeSignup()`, and `verifyEmail()` below
 * go away — Supabase's own auth calls (signInWithPassword, signUp, etc.)
 * become the things screens call instead, and this listener keeps state
 * in sync automatically.
 * -----------------------------------------------------------------------
 */

import React, { createContext, useContext, useState, useMemo } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  /** The email a student just signed up with, kept around only so
   *  SplashScreen can route back to EmailVerification with the right
   *  email if the app is reopened before verifying. */
  pendingEmail: string | null;

  // Placeholder actions — see the Supabase note above for what replaces
  // these once real auth is wired up.
  login: () => void;
  completeSignup: (email: string) => void;
  verifyEmail: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isEmailVerified,
      pendingEmail,

      // Login screen's success path. In this placeholder phase there's no
      // real backend to confirm verification status against, so a
      // successful login is treated as fully authenticated + verified —
      // matching the explicit "Log In should navigate to MainTabs for
      // now" behavior requested for this stage.
      login: () => {
        setIsAuthenticated(true);
        setIsEmailVerified(true);
      },

      // Signup screen's success path. The student now has an account but
      // hasn't verified their email yet, so isEmailVerified stays false —
      // this keeps RootNavigator on AuthStack (showing EmailVerification)
      // rather than jumping straight into MainTabs.
      completeSignup: (email: string) => {
        setIsAuthenticated(true);
        setIsEmailVerified(false);
        setPendingEmail(email);
      },

      // Not wired to any button yet (no screen currently has a "I've
      // verified" action — real verification happens by clicking the
      // email link). Included so it's ready once that flow exists.
      verifyEmail: () => {
        setIsEmailVerified(true);
        setPendingEmail(null);
      },

      logout: () => {
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setPendingEmail(null);
      },
    }),
    [isAuthenticated, isEmailVerified, pendingEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
