import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authService } from '../services/auth';
import { tokenStorage } from '../services/tokenStorage';
import { setOnUnauthorized } from '../services/api';
import { User } from '../types/user';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  completeSignup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  // Bootstraps session on app launch: if a token exists, try to fetch the user.
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
          const currentUser = await authService.fetchCurrentUser();
          setUser(currentUser);
        }
      } catch {
        await tokenStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Lets the axios interceptor force a logout if a refresh attempt fails (e.g. expired refresh token).
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authService.login({ email, password });
    const currentUser = await authService.fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const completeSignup = useCallback(
    async (fullName: string, email: string, password: string) => {
      await authService.signup({ full_name: fullName, email, password });
      const currentUser = await authService.fetchCurrentUser();
      setUser(currentUser);
    },
    [],
  );

  const verifyEmail = useCallback(async (email: string, code: string) => {
    await authService.verifyEmail({ email, code });
    // Refresh user so `is_verified` reflects the new state.
    const currentUser = await authService.fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      completeSignup,
      logout,
      verifyEmail,
      refreshUser,
    }),
    [user, isLoading, login, completeSignup, logout, verifyEmail, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
