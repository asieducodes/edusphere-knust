/**
 * EduSphere — hooks/useCall.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around callService — matches CallScreen (token,
 * fetched fresh on every join, hence a mutation not a cached query) and
 * GroupDetailsScreen's live participant-count badge (a query, polled
 * while the screen is focused).
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import * as callService from '../services/callService';
import { queryKeys } from '../lib/queryClient';

export function useJoinCall(groupId: string) {
  return useMutation({
    mutationFn: () => callService.getCallToken(groupId).then((r) => r.data),
  });
}

export function useCallParticipantCount(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.callParticipants(groupId),
    queryFn: () => callService.getCallParticipantCount(groupId).then((r) => r.data),
    enabled,
    refetchInterval: 20 * 1000,
    staleTime: 0,
  });
}
