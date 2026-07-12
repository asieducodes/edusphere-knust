export type UserLevel = '100' | '200' | '300' | '400' | '500' | '600';
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  programme: string | null;
  department: string | null;
  college: string | null;
  level: UserLevel | null;
  role: UserRole;
  is_verified: boolean;
  is_suspended: boolean;
  rating_average: number | null;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  bio?: string;
  programme?: string;
  department?: string;
  college?: string;
  level?: UserLevel;
  avatar_url?: string;
  interests?: string[];
  skills?: string[];
}

export interface ProfileSettings {
  show_profile: boolean;
  allow_group_invites: boolean;
  show_ratings: boolean;
  allow_study_requests: boolean;
}