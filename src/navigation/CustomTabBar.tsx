/**
 * EduSphere — navigation/CustomTabBar.tsx
 * -----------------------------------------------------------------------
 * A custom-styled bottom tab bar used by AppNavigator. This replaces the
 * hardcoded nav bar that used to live inside each screen — now there's
 * exactly one nav bar, shared by every screen, driven by real navigation.
 * -----------------------------------------------------------------------
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ThemeColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Maps each route name to the Feather icon it should display.
const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Groups: 'users',
  Resources: 'folder',
  Map: 'map',
  Profile: 'user',
};

// route.name is the fixed English screen key (see MainTabNavigator) — the
// translated label shown to the student is looked up from it, rather than
// translating route.name itself, which navigation logic depends on.
const TAB_LABEL_KEYS: Record<string, string> = {
  Home: 'nav.home',
  Groups: 'nav.groups',
  Resources: 'nav.resources',
  Map: 'nav.map',
  Profile: 'nav.profile',
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const labelKey = TAB_LABEL_KEYS[route.name];
        const label = labelKey ? t(labelKey) : route.name;

        const isActive = state.index === index;
        const icon = TAB_ICONS[route.name] ?? 'circle';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={onPress}
          >
            <Feather name={icon} size={22} color={isActive ? colors.primary : colors.textMuted} />
            <Text style={[styles.navLabel, { color: isActive ? colors.primary : colors.textMuted }]}>
              {label}
            </Text>
            {isActive && <View style={styles.navActiveIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;

function createStyles(COLORS: ThemeColors, insetBottom: number) {
  return StyleSheet.create({
    bottomNav: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.card,
      paddingTop: 10,
      // 22 is the breathing room we actually want above the labels;
      // insetBottom (the nav bar / home indicator) stacks on top of that
      // instead of replacing it — this used to be ignored entirely, so
      // the tab bar sat flush against and got covered by the system bar.
      paddingBottom: 22 + insetBottom,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: '#1B1F3B',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 10,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navLabel: {
      fontSize: 10.5,
      fontWeight: '600',
      marginTop: 4,
    },
    navActiveIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.primary,
      marginTop: 4,
    },
  });
}
