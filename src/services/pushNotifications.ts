/**
 * EduSphere — services/pushNotifications.ts
 * -----------------------------------------------------------------------
 * Gets this device an Expo push token and registers it with the backend
 * so createNotification's server-side push (see backend's
 * push.service.ts) actually reaches the phone's OS notification tray —
 * not just the in-app notification list.
 *
 * Entirely best-effort: a denied permission, a simulator with no push
 * capability, or a registration failure should never break login/app
 * startup, so every function here swallows its own errors.
 * -----------------------------------------------------------------------
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as notificationService from './notificationService';
import { savePushToken, getStoredPushToken, deleteStoredPushToken } from './pushTokenStorage';

// Foreground behavior — without this, expo-notifications defaults to NOT
// showing a banner while the app is open. The whole point here is "you
// see it in your phone's notifications," so show it foreground or not.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** Call once the student is authenticated (see AuthContext). Requests
 *  permission if needed, gets an Expo push token, and registers it with
 *  the backend. No-ops quietly on a simulator/emulator without push
 *  capability, on permission denial, or on any other failure. */
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const token = tokenResponse.data;

    await savePushToken(token);
    await notificationService.registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  } catch {
    // Best-effort — push is an enhancement, never a blocker.
  }
}

/** Call on logout so a signed-out device stops receiving push meant for
 *  whoever's no longer using it here. */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const token = await getStoredPushToken();
    if (!token) return;
    await notificationService.unregisterPushToken(token);
    await deleteStoredPushToken();
  } catch {
    // Best-effort — a failed unregister just means the token lingers
    // server-side until it goes stale on its own next send attempt.
  }
}
