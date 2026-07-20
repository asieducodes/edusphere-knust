/**
 * EduSphere — theme/colors.ts
 * -----------------------------------------------------------------------
 * Light + dark palettes, same key set in both so every screen can swap
 * one for the other via useTheme() (see context/ThemeContext.tsx) without
 * any call site needing to know which theme is active. Import COLORS
 * directly only from a component's *rendered* scope (via useTheme()) —
 * never at module scope, since StyleSheet.create bakes color values in
 * at the time it runs and won't react to a later theme change.
 *
 * primary/primaryLight/primarySoft swap based on the student's chosen
 * accent color (Settings > Accent Color); everything else — including
 * success/warning/danger/star — stays fixed regardless of accent, since
 * those carry a specific meaning (error, success...) that shouldn't
 * change just because someone picked green as their accent.
 * -----------------------------------------------------------------------
 */

export type AccentColor = 'blue' | 'red' | 'green' | 'yellow';

export const ACCENT_COLORS: AccentColor[] = ['blue', 'red', 'green', 'yellow'];
export const DEFAULT_ACCENT: AccentColor = 'blue';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primarySoft: string;
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  star: string;
  danger: string;
  dangerLight: string;
  white: string;
  chipBg: string;
}

type AccentPalette = Pick<ThemeColors, 'primary' | 'primaryLight' | 'primarySoft'>;
type BaseColors = Omit<ThemeColors, 'primary' | 'primaryLight' | 'primarySoft'>;

const lightBase: BaseColors = {
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

const darkBase: BaseColors = {
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

const ACCENT_PALETTES: Record<AccentColor, { light: AccentPalette; dark: AccentPalette }> = {
  blue: {
    light: { primary: '#2D3FE0', primaryLight: '#EBEDFC', primarySoft: '#DEE2FB' },
    dark: { primary: '#5B6EF5', primaryLight: '#1E2340', primarySoft: '#2A2F55' },
  },
  red: {
    light: { primary: '#DC2626', primaryLight: '#FCE8E8', primarySoft: '#F8D0D0' },
    dark: { primary: '#F87171', primaryLight: '#3A1A1A', primarySoft: '#4A2323' },
  },
  green: {
    light: { primary: '#16A34A', primaryLight: '#E6F7EC', primarySoft: '#CFEFDA' },
    dark: { primary: '#4ADE80', primaryLight: '#153A24', primarySoft: '#1E4A30' },
  },
  yellow: {
    light: { primary: '#CA8A04', primaryLight: '#FDF3D9', primarySoft: '#FBE7B0' },
    dark: { primary: '#FACC15', primaryLight: '#3A2E05', primarySoft: '#4A3A08' },
  },
};

export function getColors(isDark: boolean, accent: AccentColor = DEFAULT_ACCENT): ThemeColors {
  const base = isDark ? darkBase : lightBase;
  const palette = isDark ? ACCENT_PALETTES[accent].dark : ACCENT_PALETTES[accent].light;
  return { ...base, ...palette };
}

/** Static fallback for the handful of call sites that can't reach a hook
 *  (e.g. module-scope constants outside any component). Prefer
 *  useTheme().colors everywhere a component is rendering. */
export const COLORS = getColors(false);

export const SHADOW = {
  shadowColor: '#1B1F3B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};
