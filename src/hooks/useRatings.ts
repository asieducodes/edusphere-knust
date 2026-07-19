/**
 * EduSphere — hooks/useRatings.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around ratingService — used by GroupDetailsScreen's
 * "Rate Group" and MemberProfileScreen's "Rate Student" actions, plus the
 * reviews list on each. Group/user averages are computed live on the
 * backend, so submitting a rating just needs to invalidate the right
 * caches to pick up the new average and the new review.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ratingService from '../services/ratingService';
import { CreateRatingPayload } from '../services/ratingService';
import { queryKeys } from '../lib/queryClient';
import { PaginationParams } from '../types/api';

export function useCreateRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRatingPayload) => ratingService.createRating(payload).then((r) => r.data),
    onSuccess: (_data, variables) => {
      if (variables.targetType === 'group') {
        queryClient.invalidateQueries({ queryKey: queryKeys.group(variables.targetId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.groupRatings(variables.targetId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
        queryClient.invalidateQueries({ queryKey: queryKeys.recommendedGroups });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(variables.targetId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.userRatings(variables.targetId) });
      }
    },
  });
}

export function useUserRatings(userId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.userRatings(userId),
    queryFn: () => ratingService.getUserRatings(userId, params).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useGroupRatings(groupId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.groupRatings(groupId),
    queryFn: () => ratingService.getGroupRatings(groupId, params).then((r) => r.data),
    enabled: !!groupId,
  });
}
