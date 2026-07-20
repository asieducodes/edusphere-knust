/**
 * EduSphere — context/ThemeContext.tsx
 * -----------------------------------------------------------------------
 * Drives Light/Dark/System across the whole app. "system" tracks the OS
 * setting live via useColorScheme() — flips instantly if the student
 * changes their phone's appearance while the app is open, no restart
 * needed. The resolved `colors` object is what every screen's styles are
 * built from (see theme/colors.ts's note on why StyleSheet.create can't
 * just read a mutable COLORS constant).
 *
 * Also drives the accent color (blue/red/green/yellow) — a separate axis
 * from light/dark, both persisted independently.
 * -----------------------------------------------------------------------
 */

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { getColors, ThemeColors, AccentColor, ACCENT_COLORS, DEFAULT_ACCENT } from '../theme/colors';
import {
  getStoredThemeMode,
  setStoredThemeMode,
  getStoredAccentColor,
  setStoredAccentColor,
} from '../services/preferencesStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isAccentColor(value: string | null): value is AccentColor {
  return !!value && (ACCENT_COLORS as string[]).includes(value);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<AccentColor>(DEFAULT_ACCENT);

  useEffect(() => {
    (async () => {
      const [storedMode, storedAccent] = await Promise.all([getStoredThemeMode(), getStoredAccentColor()]);
      if (isThemeMode(storedMode)) setModeState(storedMode);
      if (isAccentColor(storedAccent)) setAccentState(storedAccent);
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setStoredThemeMode(next).catch(() => undefined);
  }, []);

  const setAccent = useCallback((next: AccentColor) => {
    setAccentState(next);
    setStoredAccentColor(next).catch(() => undefined);
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = useMemo(() => getColors(isDark, accent), [isDark, accent]);

  const value = useMemo(
    () => ({ mode, isDark, colors, setMode, accent, setAccent }),
    [mode, isDark, colors, setMode, accent, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
