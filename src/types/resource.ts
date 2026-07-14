/**
 * EduSphere — types/resource.ts
 * -----------------------------------------------------------------------
 * Resource shapes — matches ResourcesScreen/ResourceDetailsScreen's
 * fileType badges, and UploadResourceScreen's form (title, course,
 * description, category, visibility, optional related group).
 * -----------------------------------------------------------------------
 */

import { PaginationParams } from './api';

export type ResourceFileType = 'PDF' | 'DOCX' | 'PPTX';
export type ResourceVisibility = 'Public' | 'Group Only' | 'Private';

export interface ResourceUploader {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileType: ResourceFileType;
  fileUrl: string;
  size: string;
  courseCode: string;
  category: string;
  visibility: ResourceVisibility;
  groupId?: string | null;
  uploadedBy: ResourceUploader;
  downloadsCount: number;
  savesCount: number;
  rating?: number;
  /** Whether the current signed-in student has bookmarked this. */
  isSaved?: boolean;
  createdAt: string;
}

/** A local file reference as picked by expo-document-picker (or similar) —
 *  not the actual binary, just enough info to attach it to FormData. */
export interface LocalFile {
  uri: string;
  name: string;
  type: string;
}

/** Matches UploadResourceScreen's form fields exactly. */
export interface UploadResourcePayload {
  file: LocalFile;
  title: string;
  description: string;
  courseId: string;
  category: string;
  visibility: ResourceVisibility;
  groupId?: string;
}

/** Matches ResourcesScreen's search bar + category filter chips. */
export interface ResourceQueryParams extends PaginationParams {
  search?: string;
  category?: string;
  courseCode?: string;
  groupId?: string;
}

export interface ResourceReview {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}
