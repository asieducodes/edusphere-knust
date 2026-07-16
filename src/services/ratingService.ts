/**
 * EduSphere — services/ratingService.ts
 * -----------------------------------------------------------------------
 * Wraps /ratings endpoints — matches the star ratings shown throughout
 * the app (Group cards, ProfileScreen's stat row, Recommended Groups).
 *
 * NOTE: no dedicated types/rating.ts was in the requested type-file list,
 * so the Rating/CreateRatingPayload shapes are kept local to this file
 * rather than adding an extra file for two small interfaces.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData, PaginationParams } from '../types/api';

export type RatingTargetType = 'group' | 'user';

export interface Rating {
  id: string;
  targetType: RatingTargetType;
  targetId: string;
  raterId: string;
  score: number; // e.g. 1–5
  comment?: string;
  createdAt: string;
}

export interface CreateRatingPayload {
  targetType: RatingTargetType;
  targetId: string;
  score: number;
  comment?: string;
}

/** POST /ratings */
export async function createRating(payload: CreateRatingPayload): Promise<ApiResponse<Rating>> {
  const response = await api.post<ApiResponse<Rating>>('/ratings', payload);
  return response.data;
}

/** GET /users/:userId/ratings — matches ProfileScreen's "Rating" stat. */
export async function getUserRatings(
  userId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<Rating>>> {
  const response = await api.get<ApiResponse<PaginatedData<Rating>>>(`/users/${userId}/ratings`, { params });
  return response.data;
}

/** GET /groups/:groupId/ratings — matches the star rating shown on
 *  group cards and GroupDetailsScreen's hero card. */
export async function getGroupRatings(
  groupId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<Rating>>> {
  const response = await api.get<ApiResponse<PaginatedData<Rating>>>(`/groups/${groupId}/ratings`, { params });
  return response.data;
}
