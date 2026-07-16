/**
 * EduSphere — services/resourceService.ts
 * -----------------------------------------------------------------------
 * Wraps every /resources endpoint — matches ResourcesScreen (list/search/
 * filter), UploadResourceScreen (upload), and ResourceDetailsScreen
 * (download, save/bookmark, reviews).
 * -----------------------------------------------------------------------
 */

import * as FileSystem from 'expo-file-system/legacy';
import api, { API_BASE_URL } from './api';
import { getToken } from './tokenStorage';
import { ApiResponse, PaginatedData } from '../types/api';
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
export async function getResources(params?: ResourceQueryParams): Promise<ApiResponse<PaginatedData<Resource>>> {
  const response = await api.get<ApiResponse<PaginatedData<Resource>>>('/resources', { params });
  return response.data;
}

/** GET /resources/:resourceId — matches ResourceDetailsScreen's
 *  fallback-to-sample pattern; call this when only a resourceId is known. */
export async function getResourceById(resourceId: string): Promise<ApiResponse<Resource>> {
  const response = await api.get<ApiResponse<Resource>>(`/resources/${resourceId}`);
  return response.data;
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
}

/** POST /resources — multipart/form-data upload. Matches
 *  UploadResourceScreen's form exactly: file, title, description,
 *  course, category, visibility, and an optional related group.
 *
 *  Uses expo-file-system's native upload task rather than axios/XHR —
 *  React Native's XHR polyfill routinely fails to report a real `total`
 *  for multipart file bodies (axios's onUploadProgress fires but with
 *  total=0/undefined), which is why the progress bar never animated.
 *  The native task reads the local file's size upfront and reports real
 *  totalBytesSent/totalBytesExpectedToSend as the OS-level upload
 *  session progresses. It also has no JS-configurable timeout, sidestepping
 *  the same "large upload look like a dead server" problem a short axios
 *  timeout caused. Bypasses the shared `api` instance entirely, so errors
 *  are normalized by hand to the same {message, statusCode, errors} shape
 *  api.ts's interceptor produces, so every caller's error handling still works. */
export async function uploadResource(
  payload: UploadResourcePayload,
  options?: { onUploadProgress?: (event: UploadProgressEvent) => void }
): Promise<ApiResponse<Resource>> {
  const token = await getToken();

  const parameters: Record<string, string> = {
    title: payload.title,
    description: payload.description,
    course_code: payload.courseCode,
    category: payload.category,
    visibility: payload.visibility,
  };
  if (payload.groupId) {
    parameters.group_id = payload.groupId;
  }

  const uploadTask = FileSystem.createUploadTask(
    `${API_BASE_URL}/resources`,
    payload.file.uri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType: payload.file.type,
      parameters,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
    (data) => {
      options?.onUploadProgress?.({ loaded: data.totalBytesSent, total: data.totalBytesExpectedToSend });
    }
  );

  let result;
  try {
    result = await uploadTask.uploadAsync();
  } catch {
    throw { message: 'Unable to reach the server. Check your internet connection.' };
  }

  if (!result) {
    throw { message: 'Upload was cancelled.' };
  }

  let body: (ApiResponse<Resource> & { errors?: Record<string, string[]> }) | undefined;
  try {
    body = JSON.parse(result.body);
  } catch {
    body = undefined;
  }

  if (result.status < 200 || result.status >= 300) {
    throw {
      message: body?.message || 'Something went wrong. Please try again.',
      statusCode: result.status,
      errors: body?.errors,
    };
  }

  if (!body) {
    throw { message: 'Received an invalid response from the server.' };
  }

  return body;
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
): Promise<ApiResponse<PaginatedData<ResourceReview>>> {
  const response = await api.get<ApiResponse<PaginatedData<ResourceReview>>>(`/resources/${resourceId}/reviews`, {
    params,
  });
  return response.data;
}
