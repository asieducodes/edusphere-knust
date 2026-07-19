/**
 * EduSphere — services/adminService.ts
 * -----------------------------------------------------------------------
 * Wraps every /admin endpoint. No screens call this yet — no admin UI
 * exists — but the service layer is ready whenever one gets built.
 *
 * DashboardStats/AdminUser etc. live here rather than in their own
 * types/admin.ts for now; easy to split out later if the admin UI grows.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginationParams } from '../types/api';
import { Group, GroupQueryParams } from '../types/group';
import { Resource, ResourceQueryParams } from '../types/resource';
import { Report, ReportStatus } from '../types/report';
import { Department, CourseQueryParams } from '../types/course';
import { CampusLocation, LocationQueryParams } from '../types/location';

// -----------------------------------------------------------------------
// Local admin-only types
// -----------------------------------------------------------------------
export interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  totalResources: number;
  pendingReports: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isSuspended: boolean;
  createdAt: string;
}

export interface AdminUserQueryParams extends PaginationParams {
  search?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

// -----------------------------------------------------------------------
// DASHBOARD
// -----------------------------------------------------------------------
export async function getDashboard(): Promise<ApiResponse<DashboardStats>> {
  const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
  return response.data;
}

// -----------------------------------------------------------------------
// USERS
// -----------------------------------------------------------------------
export async function getUsers(params?: AdminUserQueryParams): Promise<ApiResponse<AdminUser[]>> {
  const response = await api.get<ApiResponse<AdminUser[]>>('/admin/users', { params });
  return response.data;
}

export async function suspendUser(userId: string): Promise<ApiResponse<AdminUser>> {
  const response = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/suspend`);
  return response.data;
}

export async function unsuspendUser(userId: string): Promise<ApiResponse<AdminUser>> {
  const response = await api.patch<ApiResponse<AdminUser>>(`/admin/users/${userId}/unsuspend`);
  return response.data;
}

// -----------------------------------------------------------------------
// GROUPS (moderation)
// -----------------------------------------------------------------------
export async function getAdminGroups(params?: GroupQueryParams): Promise<ApiResponse<Group[]>> {
  const response = await api.get<ApiResponse<Group[]>>('/admin/groups', { params });
  return response.data;
}

export async function deleteAdminGroup(groupId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/admin/groups/${groupId}`);
  return response.data;
}

// -----------------------------------------------------------------------
// RESOURCES (moderation)
// -----------------------------------------------------------------------
export async function getAdminResources(params?: ResourceQueryParams): Promise<ApiResponse<Resource[]>> {
  const response = await api.get<ApiResponse<Resource[]>>('/admin/resources', { params });
  return response.data;
}

export async function deleteAdminResource(resourceId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/admin/resources/${resourceId}`);
  return response.data;
}

// -----------------------------------------------------------------------
// REPORTS (moderation)
// -----------------------------------------------------------------------
export async function getAdminReports(params?: PaginationParams): Promise<ApiResponse<Report[]>> {
  const response = await api.get<ApiResponse<Report[]>>('/admin/reports', { params });
  return response.data;
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<ApiResponse<Report>> {
  const response = await api.patch<ApiResponse<Report>>(`/admin/reports/${reportId}/status`, { status });
  return response.data;
}

// -----------------------------------------------------------------------
// DEPARTMENTS (CRUD)
// -----------------------------------------------------------------------
export async function createDepartment(payload: Omit<Department, 'id'>): Promise<ApiResponse<Department>> {
  const response = await api.post<ApiResponse<Department>>('/admin/departments', payload);
  return response.data;
}

export async function updateDepartment(
  departmentId: string,
  payload: Partial<Omit<Department, 'id'>>
): Promise<ApiResponse<Department>> {
  const response = await api.put<ApiResponse<Department>>(`/admin/departments/${departmentId}`, payload);
  return response.data;
}

export async function deleteDepartment(departmentId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/admin/departments/${departmentId}`);
  return response.data;
}

// -----------------------------------------------------------------------
// LOCATIONS (CRUD)
// -----------------------------------------------------------------------
export async function createLocation(payload: Omit<CampusLocation, 'id'>): Promise<ApiResponse<CampusLocation>> {
  const response = await api.post<ApiResponse<CampusLocation>>('/admin/locations', payload);
  return response.data;
}

export async function updateLocation(
  locationId: string,
  payload: Partial<Omit<CampusLocation, 'id'>>
): Promise<ApiResponse<CampusLocation>> {
  const response = await api.put<ApiResponse<CampusLocation>>(`/admin/locations/${locationId}`, payload);
  return response.data;
}

export async function deleteLocation(locationId: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/admin/locations/${locationId}`);
  return response.data;
}

// -----------------------------------------------------------------------
// ANNOUNCEMENTS
// -----------------------------------------------------------------------
export async function createAnnouncement(payload: CreateAnnouncementPayload): Promise<ApiResponse<Announcement>> {
  const response = await api.post<ApiResponse<Announcement>>('/admin/announcements', payload);
  return response.data;
}

// Re-exported so callers don't need to import CourseQueryParams/LocationQueryParams
// separately just to call getAdminGroups/getAdminResources's cousins above —
// kept here for discoverability if this file grows a getLocations admin-scoped
// listing later.
export type { CourseQueryParams, LocationQueryParams };
