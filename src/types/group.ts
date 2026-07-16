/**
 * EduSphere — types/group.ts
 * -----------------------------------------------------------------------
 * Study group shapes, plus group discussions (posts/comments) and
 * invites — matches CreateGroupScreen's form and GroupDetailsScreen's
 * discussion preview / shared resources sections.
 * -----------------------------------------------------------------------
 */

import { PaginationParams } from './api';

export type GroupType = 'Public' | 'Private';

export interface Group {
  id: string;
  name: string;
  courseCode: string;
  courseTitle: string;
  description: string;
  tags: string[];
  groupType: GroupType;
  maxMembers?: number;
  membersCount: number;
  rating?: number;
  /** Whether the current signed-in student has already joined. */
  isJoined?: boolean;

  meetingLocation?: string;
  meetingDay?: string;
  meetingTime?: string;

  allowMemberUploads: boolean;
  allowMemberInvites: boolean;

  createdAt: string;
}

/** Matches CreateGroupScreen's form fields exactly. */
export interface CreateGroupPayload {
  name: string;
  courseCode: string;
  courseTitle: string;
  description: string;
  tags: string[];
  groupType: GroupType;
  maxMembers?: number;
  allowMemberUploads: boolean;
  allowMemberInvites: boolean;
  meetingLocation?: string;
  meetingDay?: string;
  meetingTime?: string;
}

/** Matches GroupsScreen's search bar + filter chips. */
export interface GroupQueryParams extends PaginationParams {
  search?: string;
  category?: string;
  courseCode?: string;
}

export interface InviteMemberPayload {
  email: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

/** Matches GroupDetailsScreen's "Members" section. */
export interface GroupMember {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: 'owner' | 'member';
}

// -----------------------------------------------------------------------
// Discussions (GroupDetailsScreen's "Recent Discussions" section)
// -----------------------------------------------------------------------
export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  body?: string;
  repliesCount: number;
  createdAt: string;
}

export interface CreatePostPayload {
  title: string;
  body?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  body: string;
}
