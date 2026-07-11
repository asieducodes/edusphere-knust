/**
 * EduSphere brand theme.
 * Primary: royal blue. Amber: CTAs and active states.
 */
export const colors = {
  primary: '#2D3FE0',
  primaryDark: '#212DB0',
  primaryLight: '#5A68E8',

  amber: '#F5A623',
  amberDark: '#D68910',

  background: '#FFFFFF',
  surface: '#F7F8FC',
  border: '#E5E7F0',

  textPrimary: '#0B0B0F',
  textSecondary: '#5A5D6B',
  textInverse: '#FFFFFF',

  success: '#22A559',
  warning: '#F5A623',
  error: '#E0392D',
  info: '#2D3FE0',

  overlay: 'rgba(11, 11, 15, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 15, fontWeight: '600' as const },
};

export const theme = { colors, spacing, radius, typography };
export type Theme = typeof theme;
