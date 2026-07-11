import { Course } from './course';
import { User } from './user';

export type GroupPrivacy = 'public' | 'private';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  course: Course;
  host: User;
  member_count: number;
  max_members: number | null;
  privacy: GroupPrivacy;
  meeting_location: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface GroupMember {
  user: User;
  joined_at: string;
  is_host: boolean;
}

export interface CreateGroupPayload {
  name: string;
  description: string;
  course_id: string;
  max_members?: number;
  privacy: GroupPrivacy;
  meeting_location?: string;
}

export interface DiscussionPost {
  id: string;
  group_id: string;
  author: User;
  content: string;
  reply_count: number;
  created_at: string;
}
