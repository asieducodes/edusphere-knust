/**
 * EduSphere — navigation/MainStackNavigator.tsx
 * -----------------------------------------------------------------------
 * The authenticated app. Holds MainTabs (the 5-tab bottom nav, see
 * MainTabNavigator.tsx) as its first screen, plus every screen that opens
 * "on top of" the tabs with a back button and no bottom nav — GroupDetails,
 * CreateGroup, ResourceDetails, UploadResource, EditProfile. Rendered by
 * RootNavigator once `isAuthenticated && isEmailVerified` is true.
 *
 * This replaces the old AppNavigator.tsx, which used to hold both the
 * auth screens and these — now split so auth and main are separate trees
 * (see navigation/RootNavigator.tsx for why that split matters).
 * -----------------------------------------------------------------------
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "./types";

import MainTabNavigator from "./MainTabNavigator";
import GroupDetailsScreen from "../screens/GroupDetailsScreen";
import PostDetailsScreen from "../screens/PostDetailsScreen";
import SearchScreen from "../screens/SearchScreen";
import SettingsScreen from "../screens/SettingsScreen";
import PrivacySecurityScreen from "../screens/PrivacySecurityScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import ResourceDetailsScreen from "../screens/ResourceDetailsScreen";
import UploadResourceScreen from "../screens/UploadResourceScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import NotificationDetailScreen from "../screens/NotificationDetailScreen";
import CallScreen from "../screens/CallScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} />
      <Stack.Screen name="UploadResource" component={UploadResourceScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      <Stack.Screen
        name="Call"
        component={CallScreen}
        options={{ animation: "fade", gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
