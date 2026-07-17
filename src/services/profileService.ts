/**
 * EduSphere — services/profileService.ts
 * -----------------------------------------------------------------------
 * Wraps GET/PUT /profile/me and POST /profile/avatar — matches
 * ProfileScreen (display) and EditProfileScreen (update + photo change).
 * -----------------------------------------------------------------------
 */

import api, { buildFormData, FormDataFile } from './api';
import { ApiResponse } from '../types/api';
import { User, UpdateProfilePayload, UploadAvatarResponseData } from '../types/user';

/** GET /profile/me */
export async function getMyProfile(): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<User>>('/profile/me');
  return response.data;
}

/** PUT /profile/me — matches EditProfileScreen's Save Changes button.
 *  Only send the fields that actually changed; all are optional. */
export async function updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<User>> {
  const response = await api.put<ApiResponse<User>>('/profile/me', payload);
  return response.data;
}

/** POST /profile/avatar — multipart/form-data upload. Matches
 *  EditProfileScreen's "Change Photo". */
export async function uploadAvatar(file: FormDataFile): Promise<ApiResponse<UploadAvatarResponseData>> {
  const formData = buildFormData({}, { fieldName: 'avatar', value: file });

  const response = await api.post<ApiResponse<UploadAvatarResponseData>>('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // See resourceService.uploadResource for why this overrides the
    // global 15s timeout.
    timeout: 5 * 60 * 1000,
  });
  return response.data;
}

/** DELETE /profile/me — matches SettingsScreen's "Delete Account". Scrubs
 *  the student's profile and permanently revokes their login server-side;
 *  the caller must still log out locally afterward. */
export async function deleteAccount(): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>('/profile/me');
  return response.data;
}
