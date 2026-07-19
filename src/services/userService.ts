/**
 * EduSphere — services/userService.ts
 * -----------------------------------------------------------------------
 * Wraps GET /users/:userId — viewing another student's profile, reached
 * by tapping a member in GroupDetailsScreen's member list. Separate from
 * profileService.ts, which is all about the signed-in student's own
 * profile.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse } from '../types/api';
import { PublicUser } from '../types/user';

/** GET /users/:userId */
export async function getUserProfile(userId: string): Promise<ApiResponse<PublicUser>> {
  const response = await api.get<ApiResponse<PublicUser>>(`/users/${userId}`);
  return response.data;
}
