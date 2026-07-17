/**
 * EduSphere — hooks/useProfile.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around profileService, plus a combined "profile
 * stats" query (groups/uploads/saved/sessions counts) used by
 * ProfileScreen — one hook instead of five separate ones firing together.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as profileService from '../services/profileService';
import * as groupService from '../services/groupService';
import * as resourceService from '../services/resourceService';
import * as sessionService from '../services/sessionService';
import { queryKeys } from '../lib/queryClient';
import { UpdateProfilePayload } from '../types/user';
import { FormDataFile } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: () => profileService.getMyProfile().then((r) => r.data),
  });
}

export interface ProfileStats {
  groups: number;
  uploads: number;
  saved: number;
  sessions: number;
}

export function useProfileStats() {
  return useQuery({
    queryKey: queryKeys.profileStats,
    queryFn: async (): Promise<ProfileStats> => {
      const [groupsRes, uploadsRes, savedRes, sessionsRes] = await Promise.all([
        groupService.getMyGroups({ limit: 1 }),
        resourceService.getResources({ mine: true, limit: 1 }),
        resourceService.getResources({ saved: true, limit: 1 }),
        sessionService.getUpcomingSessions({ limit: 1 }),
      ]);
      return {
        groups: groupsRes.data.meta.total,
        uploads: uploadsRes.data.meta.total,
        saved: savedRes.data.meta.total,
        sessions: sessionsRes.data.meta.total,
      };
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      refreshSession().catch(() => undefined);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();
  return useMutation({
    mutationFn: (file: FormDataFile) => profileService.uploadAvatar(file).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      refreshSession().catch(() => undefined);
    },
  });
}

export function useDeleteAccount() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: () => profileService.deleteAccount(),
    onSuccess: () => logout(),
  });
}
