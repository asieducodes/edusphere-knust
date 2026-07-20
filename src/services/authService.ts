/**
 * EduSphere — services/authService.ts
 * -----------------------------------------------------------------------
 * Wraps every /auth endpoint. login() and logout() also manage the stored
 * token, so screens don't need to import tokenStorage directly.
 *
 * Every function here returns response.data — the full
 * { success, message, data } envelope — per project convention. Screens
 * read the `.data` field for the payload and can use `.message` directly
 * for toasts/banners.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { saveToken, deleteToken } from './tokenStorage';
import { ApiResponse } from '../types/api';
import {
  RegisterPayload,
  RegisterResponseData,
  LoginPayload,
  LoginResponseData,
  ForgotPasswordPayload,
  ResendVerificationPayload,
  AuthMeResponseData,
} from '../types/auth';

/** POST /auth/register — matches SignupScreen's form. Saves the token when
 *  the backend issues one immediately (email auto-confirm on) — same as
 *  login(), since AuthContext treats a returned token as "already signed
 *  in" and routes straight into the main app. */
export async function register(payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> {
  const response = await api.post<ApiResponse<RegisterResponseData>>('/auth/register', payload);
  if (response.data.data?.token) {
    await saveToken(response.data.data.token);
  }
  return response.data;
}

/** POST /auth/login — matches LoginScreen's form. Saves the token on success. */
export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
  const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', payload);
  if (response.data.data?.token) {
    await saveToken(response.data.data.token);
  }
  return response.data;
}

/** POST /auth/forgot-password — matches ForgotPasswordScreen. */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/auth/forgot-password', payload);
  return response.data;
}

/** POST /auth/resend-verification — matches EmailVerificationScreen's
 *  "Resend verification link". */
export async function resendVerification(payload: ResendVerificationPayload): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/auth/resend-verification', payload);
  return response.data;
}

/** GET /auth/me — used on app start to check whether the stored token is
 *  still valid, and to know the student's verification status. */
export async function getMe(): Promise<ApiResponse<AuthMeResponseData>> {
  const response = await api.get<ApiResponse<AuthMeResponseData>>('/auth/me');
  return response.data;
}

/** POST /auth/logout — clears the stored token regardless of whether the
 *  server call succeeds, so the student is always logged out locally. */
export async function logout(): Promise<ApiResponse<null> | null> {
  try {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  } finally {
    await deleteToken();
  }
}
