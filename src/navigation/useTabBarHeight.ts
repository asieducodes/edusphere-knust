/**
 * EduSphere — navigation/useTabBarHeight.ts
 * -----------------------------------------------------------------------
 * CustomTabBar is absolutely-positioned and floats over screen content
 * (a plain Tab.Navigator custom `tabBar` render prop doesn't reserve space
 * for it automatically) — so every tab screen's scrollable content needs
 * its own bottom clearance to keep the last item from sitting behind it.
 * BASE_HEIGHT mirrors CustomTabBar's fixed content: paddingTop 10 + icon
 * 22 + label marginTop 4 + label line ~13 + the bar's own design
 * paddingBottom 22. The safe-area inset is added on top since it varies
 * by device (see CustomTabBar's own use of it for the same reason).
 * -----------------------------------------------------------------------
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_BASE_HEIGHT = 71;

export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE_HEIGHT + insets.bottom;
}
