/**
 * EduSphere — navigation/CustomTabBar.tsx
 * -----------------------------------------------------------------------
 * A custom-styled bottom tab bar used by AppNavigator. This replaces the
 * hardcoded nav bar that used to live inside each screen — now there's
 * exactly one nav bar, shared by every screen, driven by real navigation.
 * -----------------------------------------------------------------------
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../theme/colors';

// Maps each route name to the Feather icon it should display.
const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Groups: 'users',
  Resources: 'folder',
  Map: 'map',
  Profile: 'user',
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title !== undefined
            ? options.title
            : route.name;

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
            <Feather name={icon} size={22} color={isActive ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.navLabel, { color: isActive ? COLORS.primary : COLORS.textMuted }]}>
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

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingTop: 10,
    paddingBottom: 22,
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
