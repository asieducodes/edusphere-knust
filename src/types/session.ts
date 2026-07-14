/**
 * EduSphere — types/session.ts
 * -----------------------------------------------------------------------
 * Study session shapes — matches HomeScreen's "Upcoming Sessions" cards
 * and GroupDetailsScreen's "Upcoming Session" card.
 * -----------------------------------------------------------------------
 */

export interface StudySession {
  id: string;
  groupId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  attendeesCount?: number;
  /** Whether the current signed-in student has RSVP'd. */
  isAttending?: boolean;
  createdAt: string;
}

export interface CreateSessionPayload {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export type RsvpStatus = 'going' | 'not_going' | 'maybe';

export interface RsvpPayload {
  status: RsvpStatus;
}
