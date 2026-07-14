/**
 * EduSphere — theme/colors.ts
 * -----------------------------------------------------------------------
 * Single source of truth for colors and shadows across the whole app.
 * Import this in every screen instead of redefining COLORS/SHADOW locally
 * — that way, changing the primary color here updates the entire app.
 * -----------------------------------------------------------------------
 */

export const COLORS = {
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
  white: '#FFFFFF',
  chipBg: '#F1F2F8',
};

export const SHADOW = {
  shadowColor: '#1B1F3B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};
