/**
 * EduSphere — services/courseService.ts
 * -----------------------------------------------------------------------
 * Wraps GET /departments and GET /courses — matches SignupScreen's and
 * EditProfileScreen's Programme/Department dropdown pickers (currently
 * populated with static sample data, ready to swap for these calls).
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData } from '../types/api';
import { Department, Course, CourseQueryParams } from '../types/course';

/** GET /departments — supports search via query params. */
export async function getDepartments(params?: CourseQueryParams): Promise<ApiResponse<PaginatedData<Department>>> {
  const response = await api.get<ApiResponse<PaginatedData<Department>>>('/departments', { params });
  return response.data;
}

/** GET /courses — supports search + filter by department via query params. */
export async function getCourses(params?: CourseQueryParams): Promise<ApiResponse<PaginatedData<Course>>> {
  const response = await api.get<ApiResponse<PaginatedData<Course>>>('/courses', { params });
  return response.data;
}
