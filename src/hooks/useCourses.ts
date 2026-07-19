/**
 * EduSphere — hooks/useCourses.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around courseService. Departments/courses change
 * essentially never during a session, so these get a long staleTime
 * rather than the app default — no reason to refetch the department list
 * every 30s across every screen that shows a picker.
 * -----------------------------------------------------------------------
 */

import { useQuery } from '@tanstack/react-query';
import * as courseService from '../services/courseService';
import { queryKeys } from '../lib/queryClient';

const REFERENCE_DATA_STALE_TIME = 30 * 60 * 1000;

// The real department/programme catalogs run to 70-80+ rows each — well
// past the API's default page size of 20 — and these pickers need the
// whole list at once (search/filter happens client-side against it), not
// a paginated slice. 100 is the API's hard per-page cap; both catalogs
// currently fit under it in one request.
const FULL_CATALOG_PARAMS = { limit: 100 };

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => courseService.getDepartments(FULL_CATALOG_PARAMS).then((r) => r.data),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useProgrammes() {
  return useQuery({
    queryKey: queryKeys.programmes,
    queryFn: () => courseService.getProgrammes(FULL_CATALOG_PARAMS).then((r) => r.data),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
