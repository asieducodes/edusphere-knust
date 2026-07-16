/**
 * EduSphere — hooks/useSessions.ts
 * -----------------------------------------------------------------------
 * React Query wrapper around the standalone (non-group-scoped) sessions
 * endpoint — HomeScreen's "Upcoming Sessions". Group-scoped sessions live
 * in useGroups.ts's useGroupSessions, since their cache invalidation is
 * tied to a specific group.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as sessionService from '../services/sessionService';
import { queryKeys } from '../lib/queryClient';
import { RsvpPayload } from '../types/session';

export function useUpcomingSessions() {
  return useQuery({
    queryKey: queryKeys.upcomingSessions,
    queryFn: () => sessionService.getUpcomingSessions().then((r) => r.data),
  });
}

export function useRsvpSession(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: RsvpPayload }) =>
      sessionService.rsvpSession(sessionId, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.upcomingSessions });
      queryClient.invalidateQueries({ queryKey: queryKeys.groupSessions(groupId) });
    },
  });
}
