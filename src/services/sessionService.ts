/**
 * EduSphere — services/sessionService.ts
 * -----------------------------------------------------------------------
 * Wraps every /sessions endpoint — matches HomeScreen's "Upcoming
 * Sessions" and GroupDetailsScreen's "Upcoming Session" card + the
 * (currently placeholder) "Schedule Session" action.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData, PaginationParams } from '../types/api';
import { StudySession, CreateSessionPayload, RsvpPayload } from '../types/session';

/** GET /sessions/upcoming — matches HomeScreen's "Upcoming Sessions". */
export async function getUpcomingSessions(
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<StudySession>>> {
  const response = await api.get<ApiResponse<PaginatedData<StudySession>>>('/sessions/upcoming', { params });
  return response.data;
}

/** GET /groups/:groupId/sessions — matches GroupDetailsScreen's session card. */
export async function getGroupSessions(
  groupId: string,
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<StudySession>>> {
  const response = await api.get<ApiResponse<PaginatedData<StudySession>>>(`/groups/${groupId}/sessions`, {
    params,
  });
  return response.data;
}

/** POST /groups/:groupId/sessions — matches GroupDetailsScreen's
 *  "Schedule Session" action (currently a placeholder with no screen). */
export async function createGroupSession(
  groupId: string,
  payload: CreateSessionPayload
): Promise<ApiResponse<StudySession>> {
  const response = await api.post<ApiResponse<StudySession>>(`/groups/${groupId}/sessions`, payload);
  return response.data;
}

/** POST /sessions/:sessionId/rsvp */
export async function rsvpSession(
  sessionId: string,
  payload: RsvpPayload
): Promise<ApiResponse<StudySession>> {
  const response = await api.post<ApiResponse<StudySession>>(`/sessions/${sessionId}/rsvp`, payload);
  return response.data;
}
