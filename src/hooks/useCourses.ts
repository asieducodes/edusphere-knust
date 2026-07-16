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

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => courseService.getDepartments().then((r) => r.data),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}

export function useCourses() {
  return useQuery({
    queryKey: queryKeys.courses,
    queryFn: () => courseService.getCourses().then((r) => r.data),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
}
