/**
 * EduSphere — types/location.ts
 * -----------------------------------------------------------------------
 * Campus location shapes — matches MapScreen's markers, "Recommended
 * Study Spots" status chips (Open/Busy/Available), and filter chips.
 * -----------------------------------------------------------------------
 */

import { PaginationParams } from './api';

export type LocationCategory =
  | 'Library'
  | 'Lecture Hall'
  | 'Study Spot'
  | 'Cafeteria'
  | 'Department'
  | 'Hostel';

export type LocationStatus = 'open' | 'busy' | 'available' | 'closed';

export interface CampusLocation {
  id: string;
  name: string;
  category: LocationCategory;
  description?: string;
  latitude: number;
  longitude: number;
  status?: LocationStatus;
  /** Distance from the student's current position, if location
   *  permissions are granted — server can compute this from query params. */
  distanceKm?: number;
}

/** Matches MapScreen's search bar + location filter chips. */
export interface LocationQueryParams extends PaginationParams {
  search?: string;
  category?: LocationCategory;
  /** Student's current coordinates, for distance-based sorting. */
  lat?: number;
  lng?: number;
}
