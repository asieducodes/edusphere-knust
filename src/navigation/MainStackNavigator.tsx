import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import ResourceDetailsScreen from '../screens/ResourceDetailsScreen';
import UploadResourceScreen from '../screens/UploadResourceScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ title: 'Group' }} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Create Group', presentation: 'modal' }} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetailsScreen} options={{ title: 'Resource' }} />
      <Stack.Screen name="UploadResource" component={UploadResourceScreen} options={{ title: 'Upload Resource', presentation: 'modal' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}