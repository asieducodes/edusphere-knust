/**
 * EduSphere — services/preferencesStorage.ts
 * -----------------------------------------------------------------------
 * Persists small, non-secret UI preferences (theme mode, language).
 * Reuses expo-secure-store — already a dependency for the auth token
 * (see tokenStorage.ts) — rather than adding a second storage library
 * just for two string values.
 * -----------------------------------------------------------------------
 */

import * as SecureStore from 'expo-secure-store';

const THEME_MODE_KEY = 'edusphere_theme_mode';
const ACCENT_COLOR_KEY = 'edusphere_accent_color';
const LANGUAGE_KEY = 'edusphere_language';

export async function getStoredThemeMode(): Promise<string | null> {
  return SecureStore.getItemAsync(THEME_MODE_KEY);
}

export async function setStoredThemeMode(mode: string): Promise<void> {
  await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
}

export async function getStoredAccentColor(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCENT_COLOR_KEY);
}

export async function setStoredAccentColor(accent: string): Promise<void> {
  await SecureStore.setItemAsync(ACCENT_COLOR_KEY, accent);
}

export async function getStoredLanguage(): Promise<string | null> {
  return SecureStore.getItemAsync(LANGUAGE_KEY);
}

export async function setStoredLanguage(language: string): Promise<void> {
  await SecureStore.setItemAsync(LANGUAGE_KEY, language);
}
