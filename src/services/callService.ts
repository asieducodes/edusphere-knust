/**
 * EduSphere — services/callService.ts
 * -----------------------------------------------------------------------
 * Wraps the /groups/:groupId/call endpoints — matches CallScreen (token,
 * to join the LiveKit room) and GroupDetailsScreen's live participant
 * count badge on its "Join Call" action.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse } from '../types/api';
import { CallToken, CallParticipantCount } from '../types/call';

/** POST /groups/:groupId/call/token — mints a scoped LiveKit access token. */
export async function getCallToken(groupId: string): Promise<ApiResponse<CallToken>> {
  const response = await api.post<ApiResponse<CallToken>>(`/groups/${groupId}/call/token`);
  return response.data;
}

/** GET /groups/:groupId/call/participants — live "N people in this call" count. */
export async function getCallParticipantCount(groupId: string): Promise<ApiResponse<CallParticipantCount>> {
  const response = await api.get<ApiResponse<CallParticipantCount>>(`/groups/${groupId}/call/participants`);
  return response.data;
}
