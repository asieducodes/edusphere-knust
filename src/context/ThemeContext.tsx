/**
 * EduSphere — context/ThemeContext.tsx
 * -----------------------------------------------------------------------
 * Drives Light/Dark/System across the whole app. "system" tracks the OS
 * setting live via useColorScheme() — flips instantly if the student
 * changes their phone's appearance while the app is open, no restart
 * needed. The resolved `colors` object is what every screen's styles are
 * built from (see theme/colors.ts's note on why StyleSheet.create can't
 * just read a mutable COLORS constant).
 * -----------------------------------------------------------------------
 */

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import { getStoredThemeMode, setStoredThemeMode } from '../services/preferencesStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    (async () => {
      const stored = await getStoredThemeMode();
      if (isThemeMode(stored)) setModeState(stored);
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setStoredThemeMode(next).catch(() => undefined);
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(() => ({ mode, isDark, colors, setMode }), [mode, isDark, colors, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
