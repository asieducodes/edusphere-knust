/**
 * EduSphere — hooks/useNotifications.ts
 * -----------------------------------------------------------------------
 * React Query wrapper around notificationService. staleTime is short —
 * notifications (group invites, replies) are the one thing in the app
 * where "up to 30s stale" reads as actually broken rather than just
 * slightly behind, so this refetches more eagerly than the app default.
 * Any screen can call useNotifications() for the header bell's unread
 * dot — same query key, so React Query dedupes it against
 * NotificationsScreen's own call rather than firing a second request.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../services/notificationService';
import { queryKeys } from '../lib/queryClient';

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationService.getNotifications().then((r) => r.data),
    staleTime: 10 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
