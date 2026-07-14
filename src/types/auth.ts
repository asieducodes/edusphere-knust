/**
 * EduSphere — types/auth.ts
 * -----------------------------------------------------------------------
 * Request payloads and response data shapes for every /auth endpoint.
 * Matches SignupScreen's form fields (fullName, email, programme,
 * department, level, password) and LoginScreen's (email, password).
 * -----------------------------------------------------------------------
 */

import { User } from './user';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  programme: string;
  departmentId: string;
  level: string;
}

export interface RegisterResponseData {
  user: User;
  /** Most backends don't issue a session token until the email is
   *  verified — included as optional in case yours does. */
  token?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface AuthMeResponseData {
  user: User;
}
