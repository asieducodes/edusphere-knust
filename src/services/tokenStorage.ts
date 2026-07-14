/**
 * EduSphere — services/tokenStorage.ts
 * -----------------------------------------------------------------------
 * Thin wrapper around expo-secure-store for the auth token. Kept as its
 * own file (rather than folded into api.ts) so anything that needs the
 * token — the axios interceptor, AuthContext, a future auth listener —
 * imports from one place.
 *
 * INSTALLATION:
 *   npx expo install expo-secure-store
 * -----------------------------------------------------------------------
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'edusphere_auth_token';

/** Persist the auth token securely (Keychain on iOS, Keystore on Android). */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** Returns the stored token, or null if none exists yet. */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/** Clears the stored token — call this on logout, or when the API client
 *  gets a 401 back (see services/api.ts's response interceptor). */
export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
