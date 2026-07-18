/**
 * EduSphere — types/call.ts
 * -----------------------------------------------------------------------
 * Live group calling (LiveKit) — matches backend/src/services/call.service.ts.
 * -----------------------------------------------------------------------
 */

export interface CallToken {
  token: string;
  url: string;
  roomName: string;
}

export interface CallParticipantCount {
  count: number;
}
