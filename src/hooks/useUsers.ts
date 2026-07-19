/**
 * EduSphere — hooks/useUsers.ts
 * -----------------------------------------------------------------------
 * React Query wrapper around userService — matches MemberProfileScreen.
 * -----------------------------------------------------------------------
 */

import { useQuery } from '@tanstack/react-query';
import * as userService from '../services/userService';
import { queryKeys } from '../lib/queryClient';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => userService.getUserProfile(userId).then((r) => r.data),
    enabled: !!userId,
  });
}
