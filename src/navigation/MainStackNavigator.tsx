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
import CreateGroupScreen from "../screens/CreateGroupScreen";
import ResourceDetailsScreen from "../screens/ResourceDetailsScreen";
import UploadResourceScreen from "../screens/UploadResourceScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} />
      <Stack.Screen name="UploadResource" component={UploadResourceScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
