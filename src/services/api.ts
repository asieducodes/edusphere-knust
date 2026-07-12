import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Registered by AuthContext at app startup so the interceptor can trigger a
// logout without importing React context logic into this plain module.
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

api.interceptors.response.use(
  (response) => {
    // Backend wraps every success response as { success, message, data }.
    // Unwrap here so every service file can just read response.data directly,
    // instead of response.data.data everywhere.
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      onUnauthorized?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the in-flight refresh resolves.
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(api(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data: envelope } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const tokens = envelope.data ?? envelope; // unwrap envelope here too, this call bypasses the interceptor above
      await tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      pendingRequests.forEach((resolve) => resolve());
      pendingRequests = [];
      return api(originalRequest);
    } catch (refreshError) {
      pendingRequests = [];
      await tokenStorage.clearTokens();
      onUnauthorized?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

/** Builds a multipart/form-data payload for file uploads (resources, avatars). */
export function toFormData(fields: Record<string, string | number | undefined>, file?: {
  uri: string;
  name: string;
  type: string;
}): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, String(value));
  });
  if (file) {
    // React Native's FormData accepts this shape for file uploads.
    form.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
  }
  return form;
}