/**
 * EduSphere — hooks/useLocations.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around locationService — backs MapScreen's
 * college-grouped study-space cards and student status reporting.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as locationService from '../services/locationService';
import { queryKeys } from '../lib/queryClient';
import { LocationQueryParams, LocationStatus } from '../types/location';

// Same reasoning as useCourses.ts's FULL_CATALOG_PARAMS — this list is
// small, changes essentially never, and MapScreen groups/filters it
// client-side rather than paginating.
const FULL_CATALOG_PARAMS = { limit: 100 };

export function useLocations(params: LocationQueryParams = {}) {
  const merged = { ...FULL_CATALOG_PARAMS, ...params };
  return useQuery({
    queryKey: queryKeys.locations(merged),
    queryFn: () => locationService.getLocations(merged).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportLocationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, status }: { locationId: string; status: LocationStatus }) =>
      locationService.reportLocationStatus(locationId, status).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
