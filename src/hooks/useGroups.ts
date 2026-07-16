/**
 * EduSphere — hooks/useGroups.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around groupService — replaces the old per-screen
 * useState+useFocusEffect fetch pattern. Reads cache by query key so a
 * revisited screen shows data instantly instead of a fresh loading spinner;
 * mutations invalidate exactly the queries their effect could change.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as groupService from '../services/groupService';
import * as sessionService from '../services/sessionService';
import { queryKeys } from '../lib/queryClient';
import {
  CreateGroupPayload,
  CreatePostPayload,
  InviteMemberPayload,
} from '../types/group';
import { CreateSessionPayload } from '../types/session';
import { PaginationParams } from '../types/api';

export function useMyGroups() {
  return useQuery({
    queryKey: queryKeys.myGroups,
    queryFn: () => groupService.getMyGroups().then((r) => r.data),
  });
}

export function useRecommendedGroups() {
  return useQuery({
    queryKey: queryKeys.recommendedGroups,
    queryFn: () => groupService.getRecommendedGroups().then((r) => r.data),
  });
}

export function useDiscoverGroups(params: { search?: string; category?: string }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.discoverGroups(params),
    queryFn: () => groupService.getGroups(params).then((r) => r.data),
    enabled,
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => groupService.getGroupById(groupId).then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => groupService.getGroupMembers(groupId).then((r) => r.data),
    enabled: enabled && !!groupId,
  });
}

export function useGroupPosts(groupId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.groupPosts(groupId),
    queryFn: () => groupService.getGroupPosts(groupId).then((r) => r.data),
    enabled: enabled && !!groupId,
  });
}

export function useGroupSessions(groupId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.groupSessions(groupId),
    queryFn: () => sessionService.getGroupSessions(groupId).then((r) => r.data),
    enabled: enabled && !!groupId,
  });
}

// ---- Mutations ----------------------------------------------------------

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => groupService.createGroup(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
      queryClient.invalidateQueries({ queryKey: ['groups', 'discover'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => groupService.joinGroup(groupId).then((r) => r.data),
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: ['groups', 'discover'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendedGroups });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => groupService.leaveGroup(groupId),
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useInviteMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => groupService.inviteMember(groupId, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    },
  });
}

export function useCreateGroupPost(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => groupService.createGroupPost(groupId, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupPosts(groupId) });
    },
  });
}

export function useCreateGroupSession(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) =>
      sessionService.createGroupSession(groupId, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupSessions(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcomingSessions });
    },
  });
}

export function useAcceptGroupInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => groupService.acceptGroupInvite(inviteId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myGroups });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileStats });
    },
  });
}

export function useRejectGroupInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => groupService.rejectGroupInvite(inviteId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export type { PaginationParams };
