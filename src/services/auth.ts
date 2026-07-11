import { api } from './api';
import { tokenStorage } from './tokenStorage';
import {
  LoginPayload,
  SignupPayload,
  TokenResponse,
  VerifyEmailPayload,
  ForgotPasswordPayload,
} from '../types/auth';
import { User } from '../types/user';

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', payload);
    await tokenStorage.setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async signup(payload: SignupPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/signup', payload);
    await tokenStorage.setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<void> {
    await api.post('/auth/verify-email', payload);
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/verify-email/resend', { email });
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post('/auth/forgot-password', payload);
  },

  async fetchCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  async logout(): Promise<void> {
    await tokenStorage.clearTokens();
  },
};
