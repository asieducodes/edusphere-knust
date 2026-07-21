/**
 * EduSphere — services/pushTokenStorage.ts
 * -----------------------------------------------------------------------
 * Remembers the Expo push token this device last registered, so logout
 * can unregister it even if the app was killed/restarted since — same
 * pattern as tokenStorage.ts for the auth token.
 * -----------------------------------------------------------------------
 */

import * as SecureStore from 'expo-secure-store';

const PUSH_TOKEN_KEY = 'edusphere_push_token';

export async function savePushToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function getStoredPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export async function deleteStoredPushToken(): Promise<void> {
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
