/**
 * EduSphere — hooks/useReports.ts
 * -----------------------------------------------------------------------
 * React Query wrappers around reportService — used by ResourceDetailsScreen's
 * / GroupDetailsScreen's "Report" actions, and MyReportsScreen's list of
 * reports the signed-in student has filed.
 * -----------------------------------------------------------------------
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as reportService from '../services/reportService';
import { queryKeys } from '../lib/queryClient';
import { CreateReportPayload } from '../types/report';

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportService.createReport(payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myReports });
    },
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: queryKeys.myReports,
    queryFn: () => reportService.getMyReports({ limit: 100 }).then((r) => r.data),
  });
}
