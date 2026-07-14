/**
 * EduSphere — services/locationService.ts
 * -----------------------------------------------------------------------
 * Wraps /locations endpoints — matches MapScreen's markers, "Recommended
 * Study Spots" list, and category filter chips. Ready to replace
 * MapScreen's static placeholder marker positions with real
 * latitude/longitude once the backend exists.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse } from '../types/api';
import { CampusLocation, LocationQueryParams } from '../types/location';

/** GET /locations — matches MapScreen's search bar + category filter chips. */
export async function getLocations(params?: LocationQueryParams): Promise<ApiResponse<CampusLocation[]>> {
  const response = await api.get<ApiResponse<CampusLocation[]>>('/locations', { params });
  return response.data;
}

/** GET /locations/:locationId */
export async function getLocationById(locationId: string): Promise<ApiResponse<CampusLocation>> {
  const response = await api.get<ApiResponse<CampusLocation>>(`/locations/${locationId}`);
  return response.data;
}
