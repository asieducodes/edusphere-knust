/**
 * EduSphere — services/api.ts
 * -----------------------------------------------------------------------
 * The single axios instance every service imports and uses. Handles:
 *   - base URL (from EXPO_PUBLIC_API_URL, falling back to localhost)
 *   - attaching the bearer token to every request
 *   - normalizing every error into one consistent shape
 *
 * Every other service file in this folder imports `api` from here rather
 * than creating its own axios instance — that's what makes swapping the
 * base URL, adding a header, or changing error handling a one-file change.
 * -----------------------------------------------------------------------
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, deleteToken } from './tokenStorage';
import { ApiResponse, ApiError } from '../types/api';

// Falls back to a local dev server if the env var isn't set — lets the
// app run against a local backend during development without any config.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------------------
// REQUEST INTERCEPTOR — attach "Authorization: Bearer <token>"
// -----------------------------------------------------------------------
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers ?? ({} as InternalAxiosRequestConfig['headers']);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------
// RESPONSE INTERCEPTOR — normalize every failure into one ApiError shape
// -----------------------------------------------------------------------
function normalizeError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  // Server responded, but with a non-2xx status (400, 401, 404, 500, etc).
  if (error.response) {
    const body = error.response.data as (ApiResponse<unknown> & { errors?: Record<string, string[]> }) | undefined;
    return {
      message: body?.message || 'Something went wrong. Please try again.',
      statusCode: error.response.status,
      errors: body?.errors,
    };
  }

  // Request went out but no response came back (offline, DNS failure, timeout).
  if (error.request) {
    return { message: 'Unable to reach the server. Check your internet connection.' };
  }

  // Something failed before the request was even sent.
  return { message: error.message || 'An unexpected error occurred.' };
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const normalized = normalizeError(error);

    if (error.response?.status === 401) {
      // Token is invalid or expired — clear it locally. Hook this up to
      // AuthContext's logout() once the two are wired together, so the
      // app also re-routes back to Login when this fires.
      await deleteToken();
    }

    return Promise.reject(normalized);
  }
);

export default api;

// -----------------------------------------------------------------------
// MULTIPART FORM-DATA HELPER
// -----------------------------------------------------------------------
// Shared by uploadAvatar (profileService) and uploadResource
// (resourceService) — anything that needs to send a file alongside
// regular fields builds its FormData through this one helper.

export interface FormDataFile {
  uri: string;
  name: string;
  type: string;
}

/**
 * Builds a FormData object from a plain fields object plus one file.
 * Arrays are appended as repeated `key[]` entries (matches how most
 * Express/Multer-based backends expect array fields in multipart bodies).
 */
export function buildFormData(
  fields: Record<string, string | number | boolean | string[] | undefined | null>,
  file?: { fieldName: string; value: FormDataFile }
): FormData {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item));
    } else {
      formData.append(key, String(value));
    }
  });

  if (file) {
    // React Native's fetch/XHR FormData implementation accepts this
    // { uri, name, type } shape directly — it isn't a real Blob, but RN's
    // networking layer knows how to read it from the given uri.
    formData.append(file.fieldName, file.value as unknown as Blob);
  }

  return formData;
}
