/**
 * EduSphere — navigation/useTabBarHeight.ts
 * -----------------------------------------------------------------------
 * CustomTabBar floats over screen content (a custom `tabBar` render prop
 * doesn't get any space reserved for it automatically), so every tab
 * screen needs its own bottom padding to keep the last item clear of it.
 * BASE_HEIGHT adds up CustomTabBar's own fixed content — paddingTop 10 +
 * icon 22 + label margin 4 + label line ~13 + paddingBottom 22 — and the
 * safe-area inset gets added on top since that varies by device.
 * -----------------------------------------------------------------------
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_BASE_HEIGHT = 71;

export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE_HEIGHT + insets.bottom;
}
