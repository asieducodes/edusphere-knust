/**
 * EduSphere — services/resourceService.ts
 * -----------------------------------------------------------------------
 * Wraps every /resources endpoint — matches ResourcesScreen (list/search/
 * filter), UploadResourceScreen (upload), and ResourceDetailsScreen
 * (download, save/bookmark, reviews).
 * -----------------------------------------------------------------------
 */

import api, { buildFormData } from './api';
import { ApiResponse } from '../types/api';
import {
  Resource,
  UploadResourcePayload,
  ResourceQueryParams,
  ResourceReview,
  CreateReviewPayload,
} from '../types/resource';
import { PaginationParams } from '../types/api';

/** GET /resources — matches ResourcesScreen's search bar + category
 *  filter chips (Past Questions, Lecture Notes, Slides, etc). */
export async function getResources(params?: ResourceQueryParams): Promise<ApiResponse<Resource[]>> {
  const response = await api.get<ApiResponse<Resource[]>>('/resources', { params });
  return response.data;
}

/** GET /resources/:resourceId — matches ResourceDetailsScreen's
 *  fallback-to-sample pattern; call this when only a resourceId is known. */
export async function getResourceById(resourceId: string): Promise<ApiResponse<Resource>> {
  const response = await api.get<ApiResponse<Resource>>(`/resources/${resourceId}`);
  return response.data;
}

/** POST /resources — multipart/form-data upload. Matches
 *  UploadResourceScreen's form exactly: file, title, description,
 *  course, category, visibility, and an optional related group. */
export async function uploadResource(payload: UploadResourcePayload): Promise<ApiResponse<Resource>> {
  const formData = buildFormData(
    {
      title: payload.title,
      description: payload.description,
      course_id: payload.courseId,
      category: payload.category,
      visibility: payload.visibility,
      group_id: payload.groupId,
    },
    { fieldName: 'file', value: payload.file }
  );

  const response = await api.post<ApiResponse<Resource>>('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/** POST /resources/:resourceId/download — matches ResourceDetailsScreen's
 *  "Download Resource" button. Also useful for incrementing the
 *  download count server-side even if the file itself is fetched
 *  separately via fileUrl. */
export async function downloadResource(resourceId: string): Promise<ApiResponse<{ fileUrl: string }>> {
  const response = await api.post<ApiResponse<{ fileUrl: string }>>(`/resources/${resourceId}/download`);
  return response.data;
}

/** POST /resources/:resourceId/save — matches the bookmark icon on
 *  ResourcesScreen's featured cards and ResourceDetailsScreen. */
export async function saveResource(resourceId: string): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>(`/resources/${resourceId}/save`);
  return response.data;
}

/** DELETE /resources/:resourceId/save — un-bookmarking. */
export async function unsaveResource(resourceId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/resources/${resourceId}/save`);
  return response.data;
}

/** POST /resources/:resourceId/reviews — matches ResourceDetailsScreen's
 *  "Student Feedback" section. */
export async function createResourceReview(
  resourceId: string,
  payload: CreateReviewPayload
): Promise<ApiResponse<ResourceReview>> {
  const response = await api.post<ApiResponse<ResourceReview>>(`/resources/${resourceId}/reviews`, payload);
  return response.data;
}

/** GET /resources/:resourceId/reviews */
export async function getResourceReviews(
  resourceId: string,
  params?: PaginationParams
): Promise<ApiResponse<ResourceReview[]>> {
  const response = await api.get<ApiResponse<ResourceReview[]>>(`/resources/${resourceId}/reviews`, { params });
  return response.data;
}
