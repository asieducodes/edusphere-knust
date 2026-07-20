/**
 * EduSphere — services/locationService.ts
 * -----------------------------------------------------------------------
 * Wraps /locations endpoints — matches MapScreen's study-space cards,
 * college filter chips, and student-reported status chips.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData } from '../types/api';
import { CampusLocation, LocationQueryParams, LocationStatus } from '../types/location';

/** GET /locations — matches MapScreen's search bar + college/category filter chips. */
export async function getLocations(
  params?: LocationQueryParams
): Promise<ApiResponse<PaginatedData<CampusLocation>>> {
  const response = await api.get<ApiResponse<PaginatedData<CampusLocation>>>('/locations', { params });
  return response.data;
}

/** GET /locations/:locationId */
export async function getLocationById(locationId: string): Promise<ApiResponse<CampusLocation>> {
  const response = await api.get<ApiResponse<CampusLocation>>(`/locations/${locationId}`);
  return response.data;
}

/** PATCH /locations/:locationId/status — a student reporting how busy a spot is right now. */
export async function reportLocationStatus(
  locationId: string,
  status: LocationStatus
): Promise<ApiResponse<CampusLocation>> {
  const response = await api.patch<ApiResponse<CampusLocation>>(`/locations/${locationId}/status`, { status });
  return response.data;
}
