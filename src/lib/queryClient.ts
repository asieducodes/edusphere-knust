/**
 * EduSphere — lib/queryClient.ts
 * -----------------------------------------------------------------------
 * Single shared QueryClient. staleTime is deliberately non-zero — the old
 * pattern (useFocusEffect calling a manual fetch on every screen visit)
 * showed a full loading spinner on every single navigation, even when the
 * data was seconds old. With a real staleTime, a screen shows its cached
 * data instantly and only shows a spinner on a genuinely first load;
 * revisits refetch quietly in the background (see each hook's own
 * staleTime override for anything that should feel "more live" than the
 * default, e.g. notifications).
 * -----------------------------------------------------------------------
 */

import { QueryClient } from '@tanstack/react-query';
import { ResourceQueryParams } from '../types/resource';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Central place for every query key used across the app — keeps
// invalidation call sites (after a mutation) honest about what actually
// exists, instead of hand-typing matching key arrays in every screen.
export const queryKeys = {
  myProfile: ['profile', 'me'] as const,
  departments: ['departments'] as const,
  courses: ['courses'] as const,

  myGroups: ['groups', 'my'] as const,
  recommendedGroups: ['groups', 'recommended'] as const,
  discoverGroups: (params: { search?: string; category?: string }) => ['groups', 'discover', params] as const,
  group: (groupId: string) => ['groups', groupId] as const,
  groupMembers: (groupId: string) => ['groups', groupId, 'members'] as const,
  groupPosts: (groupId: string) => ['groups', groupId, 'posts'] as const,
  groupSessions: (groupId: string) => ['groups', groupId, 'sessions'] as const,

  resources: (params: ResourceQueryParams) => ['resources', params] as const,
  resource: (resourceId: string) => ['resources', resourceId] as const,
  resourceReviews: (resourceId: string) => ['resources', resourceId, 'reviews'] as const,
  relatedResources: (courseCode: string, excludeId: string) =>
    ['resources', 'related', courseCode, excludeId] as const,

  upcomingSessions: ['sessions', 'upcoming'] as const,

  notifications: ['notifications'] as const,

  profileStats: ['profile', 'stats'] as const,
};
