/**
 * EduSphere — services/courseService.ts
 * -----------------------------------------------------------------------
 * Wraps GET /departments and GET /programmes — matches
 * SignupScreen's and EditProfileScreen's Programme/Department dropdown
 * pickers.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData } from '../types/api';
import { Department, Programme, CourseQueryParams } from '../types/course';

/** GET /departments — supports search via query params. */
export async function getDepartments(params?: CourseQueryParams): Promise<ApiResponse<PaginatedData<Department>>> {
  const response = await api.get<ApiResponse<PaginatedData<Department>>>('/departments', { params });
  return response.data;
}

/** GET /programmes — the real KNUST undergraduate programme catalog,
 *  supports search + filter by department via query params. */
export async function getProgrammes(params?: CourseQueryParams): Promise<ApiResponse<PaginatedData<Programme>>> {
  const response = await api.get<ApiResponse<PaginatedData<Programme>>>('/programmes', { params });
  return response.data;
}
