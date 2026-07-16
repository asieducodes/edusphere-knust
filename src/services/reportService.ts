/**
 * EduSphere — services/reportService.ts
 * -----------------------------------------------------------------------
 * Wraps /reports endpoints — matches ResourceDetailsScreen's
 * "Report Resource" button (currently a placeholder with no action).
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData, PaginationParams } from '../types/api';
import { Report, CreateReportPayload } from '../types/report';

/** POST /reports */
export async function createReport(payload: CreateReportPayload): Promise<ApiResponse<Report>> {
  const response = await api.post<ApiResponse<Report>>('/reports', payload);
  return response.data;
}

/** GET /reports/my */
export async function getMyReports(params?: PaginationParams): Promise<ApiResponse<PaginatedData<Report>>> {
  const response = await api.get<ApiResponse<PaginatedData<Report>>>('/reports/my', { params });
  return response.data;
}
