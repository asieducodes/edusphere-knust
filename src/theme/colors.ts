/**
 * EduSphere — theme/colors.ts
 * -----------------------------------------------------------------------
 * Light + dark palettes, same key set in both so every screen can swap
 * one for the other via useTheme() (see context/ThemeContext.tsx) without
 * any call site needing to know which theme is active. Import COLORS
 * directly only from a component's *rendered* scope (via useTheme()) —
 * never at module scope, since StyleSheet.create bakes color values in
 * at the time it runs and won't react to a later theme change.
 * -----------------------------------------------------------------------
 */

export const lightColors = {
  primary: '#2D3FE0',
  primaryLight: '#EBEDFC',
  primarySoft: '#DEE2FB',
  background: '#F6F7FB',
  card: '#FFFFFF',
  textPrimary: '#12131A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#EEF0F6',
  success: '#1DAA61',
  successLight: '#E6F7EE',
  warning: '#F5A623',
  warningLight: '#FEF3E2',
  star: '#F5A623',
  danger: '#E14B4B',
  dangerLight: '#FDEAEA',
  white: '#FFFFFF',
  chipBg: '#F1F2F8',
};

export const darkColors: typeof lightColors = {
  primary: '#5B6EF5',
  primaryLight: '#1E2340',
  primarySoft: '#2A2F55',
  background: '#0E0F14',
  card: '#191B22',
  textPrimary: '#F2F3F7',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#262832',
  success: '#34C77B',
  successLight: '#173325',
  warning: '#F6B94A',
  warningLight: '#3A2C10',
  star: '#F6B94A',
  danger: '#F16565',
  dangerLight: '#3A1A1E',
  white: '#FFFFFF',
  chipBg: '#20222C',
};

export type ThemeColors = typeof lightColors;

/** Static fallback for the handful of call sites that can't reach a hook
 *  (e.g. module-scope constants outside any component). Prefer
 *  useTheme().colors everywhere a component is rendering. */
export const COLORS = lightColors;

export const SHADOW = {
  shadowColor: '#1B1F3B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};
