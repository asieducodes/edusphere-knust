export type UserLevel = '100' | '200' | '300' | '400' | '500' | '600';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  programme: string | null;
  department: string | null;
  college: string | null;
  level: UserLevel | null;
  is_verified: boolean;
  rating_average: number | null;
  rating_count: number;
  created_at: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  programme?: string;
  department?: string;
  college?: string;
  level?: UserLevel;
  avatar_url?: string;
}
