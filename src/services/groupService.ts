/**
 * EduSphere — services/groupService.ts
 * -----------------------------------------------------------------------
 * Wraps every /groups, /group-invites, /posts, and /comments endpoint —
 * matches GroupsScreen (list/search/filter), CreateGroupScreen (create),
 * and GroupDetailsScreen (join/leave/invite, discussions, resources tab).
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData, PaginationParams } from '../types/api';
import {
  Group,
  CreateGroupPayload,
  GroupQueryParams,
  InviteMemberPayload,
  GroupInvite,
  GroupPost,
  CreatePostPayload,
  PostComment,
  CreateCommentPayload,
  GroupMember,
} from '../types/group';

// -----------------------------------------------------------------------
// GROUPS
// -----------------------------------------------------------------------

/** GET /groups — matches GroupsScreen's "Discover Groups" list, with
 *  search + category filter chip support via query params. */
export async function getGroups(params?: GroupQueryParams): Promise<ApiResponse<PaginatedData<Group>>> {
  const response = await api.get<ApiResponse<PaginatedData<Group>>>('/groups', { params });
  return response.data;
}

/** GET /groups/my — matches GroupsScreen's/HomeScreen's "My Groups". */
export async function getMyGroups(params?: PaginationParams): Promise<ApiResponse<PaginatedData<Group>>> {
  const response = await api.get<ApiResponse<PaginatedData<Group>>>('/groups/my', { params });
  return response.data;
}

/** GET /groups/recommended — matches HomeScreen's "Recommended Groups". */
export async function getRecommendedGroups(params?: PaginationParams): Promise<ApiResponse<PaginatedData<Group>>> {
  const response = await api.get<ApiResponse<PaginatedData<Group>>>('/groups/recommended', { params });
  return response.data;
}

/** GET /groups/:groupId — matches GroupDetailsScreen's fallback-to-sample
 *  pattern; call this when only a groupId (not the full object) is
 *  available, e.g. from a deep link or notification. */
export async function getGroupById(groupId: string): Promise<ApiResponse<Group>> {
  const response = await api.get<ApiResponse<Group>>(`/groups/${groupId}`);
  return response.data;
}

/** POST /groups — matches CreateGroupScreen's "Create Study Group". */
export async function createGroup(payload: CreateGroupPayload): Promise<ApiResponse<Group>> {
  const response = await api.post<ApiResponse<Group>>('/groups', payload);
  return response.data;
}

/** POST /groups/:groupId/join — matches GroupsScreen's "Join" button and
 *  GroupDetailsScreen's "Join Group" bottom bar button. */
export async function joinGroup(groupId: string): Promise<ApiResponse<Group>> {
  const response = await api.post<ApiResponse<Group>>(`/groups/${groupId}/join`);
  return response.data;
}

/** POST /groups/:groupId/leave */
export async function leaveGroup(groupId: string): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>(`/groups/${groupId}/leave`);
  return response.data;
}

/** POST /groups/:groupId/invite — matches GroupDetailsScreen's
 *  "Invite Member" action. */
export async function inviteMember(
  groupId: string,
  payload: InviteMemberPayload
): Promise<ApiResponse<GroupInvite>> {
  const response = await api.post<ApiResponse<GroupInvite>>(`/groups/${groupId}/invite`, payload);
  return response.data;
}

/** POST /group-invites/:inviteId/accept */
export async function acceptGroupInvite(inviteId: string): Promise<ApiResponse<GroupInvite>> {
  const response = await api.post<ApiResponse<GroupInvite>>(`/group-invites/${inviteId}/accept`);
  return response.data;
}

/** POST /group-invites/:inviteId/reject */
export async function rejectGroupInvite(inviteId: string): Promise<ApiResponse<GroupInvite>> {
  const response = await api.post<ApiResponse<GroupInvite>>(`/group-invites/${inviteId}/reject`);
  return response.data;
}

/** GET /groups/:groupId/members — matches GroupDetailsScreen's "Members" section. */
export async function getGroupMembers(
  groupId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<GroupMember>>> {
  const response = await api.get<ApiResponse<PaginatedData<GroupMember>>>(`/groups/${groupId}/members`, { params });
  return response.data;
}

/** DELETE /groups/:groupId/members/:userId — owner-only. */
export async function removeMember(groupId: string, userId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/groups/${groupId}/members/${userId}`);
  return response.data;
}

// -----------------------------------------------------------------------
// DISCUSSIONS (matches GroupDetailsScreen's "Recent Discussions" section)
// -----------------------------------------------------------------------

/** GET /groups/:groupId/posts */
export async function getGroupPosts(
  groupId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<GroupPost>>> {
  const response = await api.get<ApiResponse<PaginatedData<GroupPost>>>(`/groups/${groupId}/posts`, { params });
  return response.data;
}

/** POST /groups/:groupId/posts — matches GroupDetailsScreen's
 *  "Start Discussion" action. */
export async function createGroupPost(
  groupId: string,
  payload: CreatePostPayload
): Promise<ApiResponse<GroupPost>> {
  const response = await api.post<ApiResponse<GroupPost>>(`/groups/${groupId}/posts`, payload);
  return response.data;
}

/** GET /posts/:postId/comments */
export async function getPostComments(
  postId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<PostComment>>> {
  const response = await api.get<ApiResponse<PaginatedData<PostComment>>>(`/posts/${postId}/comments`, { params });
  return response.data;
}

/** POST /posts/:postId/comments */
export async function createPostComment(
  postId: string,
  payload: CreateCommentPayload
): Promise<ApiResponse<PostComment>> {
  const response = await api.post<ApiResponse<PostComment>>(`/posts/${postId}/comments`, payload);
  return response.data;
}

/** DELETE /posts/:postId */
export async function deletePost(postId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/posts/${postId}`);
  return response.data;
}

/** DELETE /comments/:commentId */
export async function deleteComment(commentId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/comments/${commentId}`);
  return response.data;
}
