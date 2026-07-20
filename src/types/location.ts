/**
 * EduSphere — types/location.ts
 * -----------------------------------------------------------------------
 * Campus location shapes — matches MapScreen's study-space cards, grouped
 * by college, with student-reported status chips (Open/Busy/Available).
 * -----------------------------------------------------------------------
 */

import { PaginationParams } from './api';

export type LocationCategory = 'Library' | 'Study Spot';

export type LocationStatus = 'open' | 'busy' | 'available' | 'closed';

export interface CampusLocation {
  id: string;
  name: string;
  category: LocationCategory;
  /** Undefined for campus-wide spots (main library, ICT centre); set for
   *  college-specific ones (faculty/college libraries, discussion areas). */
  college?: string;
  description?: string;
  latitude: number;
  longitude: number;
  /** Self-reported by students — there's no live feed, so this is
   *  whatever the last person to tap a status chip said. */
  status?: LocationStatus;
  /** Distance from the student's current position, if location
   *  permissions are granted — server can compute this from query params. */
  distanceKm?: number;
}

/** Matches MapScreen's search bar + college/category filter chips. */
export interface LocationQueryParams extends PaginationParams {
  search?: string;
  category?: LocationCategory;
  college?: string;
  /** Student's current coordinates, for distance-based sorting. */
  lat?: number;
  lng?: number;
}
