/**
 * EduSphere — hooks/useRatings.ts
 * -----------------------------------------------------------------------
 * React Query wrapper around ratingService — used by GroupDetailsScreen's
 * "Rate Group" action. A group's average rating is computed live on the
 * backend from the ratings table, so submitting one just needs to
 * invalidate the group caches to pick up the new average.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ratingService from '../services/ratingService';
import { CreateRatingPayload } from '../services/ratingService';
import { queryKeys } from '../lib/queryClient';

export function useCreateRating(groupId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRatingPayload) => ratingService.createRating(payload).then((r) => r.data),
    onSuccess: () => {
      if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendedGroups });
    },
  });
}
