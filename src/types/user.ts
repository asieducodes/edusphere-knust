/**
 * EduSphere — types/user.ts
 * -----------------------------------------------------------------------
 * The student profile shape, returned by /auth/me and /profile/me, plus
 * the payload for updating it.
 * -----------------------------------------------------------------------
 */

export interface UserPrivacySettings {
  showProfile: boolean;
  allowGroupInvitations: boolean;
  allowDirectStudyRequests: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;

  // Academic info
  programme?: string | null;
  departmentId?: string | null;
  department?: string | null;
  college?: string | null;
  level?: string | null;

  // EditProfileScreen's Study Interests / Skills / Availability chips
  interests?: string[];
  skills?: string[];
  availability?: string[];

  privacy?: UserPrivacySettings;

  isEmailVerified: boolean;
  rating?: number;

  createdAt: string;
  updatedAt: string;
}

/** All fields optional — PUT /profile/me only needs to send what changed. */
export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  programme?: string;
  departmentId?: string;
  level?: string;
  interests?: string[];
  skills?: string[];
  availability?: string[];
  privacy?: Partial<UserPrivacySettings>;
}

/** POST /profile/avatar's response data. */
export interface UploadAvatarResponseData {
  avatarUrl: string;
}

/** GET /users/:userId — what you see viewing another student's profile.
 *  No email, no raw privacy flags; rating is omitted entirely (not just
 *  zero) if that student has no ratings yet. */
export interface PublicUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  programme: string | null;
  department: string | null;
  college: string | null;
  level: string | null;
  interests: string[];
  skills: string[];
  availability: string[];
  rating?: number;
}
