/**
 * EduSphere — navigation/MainTabNavigator.tsx
 * -----------------------------------------------------------------------
 * The 5-tab bottom navigator, rendered with our own CustomTabBar so the
 * visual design stays exactly as designed (rounded top corners, shadow,
 * active-tab dot indicator).
 *
 * This navigator is itself nested inside AppNavigator.tsx (the root
 * stack), which is what lets screens like GroupDetails open "on top of"
 * the tabs, hiding the bottom nav bar while they're open.
 * -----------------------------------------------------------------------
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from './CustomTabBar';
import { MainTabParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import GroupsScreen from '../screens/GroupsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
