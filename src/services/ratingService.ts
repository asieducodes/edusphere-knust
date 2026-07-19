/**
 * EduSphere — services/ratingService.ts
 * -----------------------------------------------------------------------
 * Wraps /ratings endpoints — matches the star ratings shown throughout
 * the app (Group cards, ProfileScreen's stat row, Recommended Groups).
 *
 * Rating/CreateRatingPayload live here instead of their own types file —
 * two small interfaces don't earn one.
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

/** What the list endpoints return — a Rating plus who left it. */
export interface RatingWithRater extends Rating {
  raterName: string;
  raterAvatarUrl: string | null;
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

/** GET /users/:userId/ratings — the reviews list on MemberProfileScreen. */
export async function getUserRatings(
  userId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<RatingWithRater>>> {
  const response = await api.get<ApiResponse<PaginatedData<RatingWithRater>>>(`/users/${userId}/ratings`, { params });
  return response.data;
}

/** GET /groups/:groupId/ratings — the reviews list on GroupDetailsScreen. */
export async function getGroupRatings(
  groupId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<RatingWithRater>>> {
  const response = await api.get<ApiResponse<PaginatedData<RatingWithRater>>>(`/groups/${groupId}/ratings`, { params });
  return response.data;
}
