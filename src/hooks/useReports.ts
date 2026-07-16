/**
 * EduSphere — hooks/useReports.ts
 * -----------------------------------------------------------------------
 * React Query wrapper around reportService — used by ResourceDetailsScreen's
 * "Report" action. No cache to invalidate; reports aren't read back
 * anywhere in the student-facing app.
 * -----------------------------------------------------------------------
 */

import { useMutation } from '@tanstack/react-query';
import * as reportService from '../services/reportService';
import { CreateReportPayload } from '../types/report';

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportService.createReport(payload).then((r) => r.data),
  });
}
