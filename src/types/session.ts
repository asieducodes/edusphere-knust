import { User } from './user';

export interface StudySession {
  id: string;
  group_id: string;
  title: string;
  location: string;
  starts_at: string;
  ends_at: string;
  created_by: User;
  attendee_count: number;
}

export interface ScheduleSessionPayload {
  group_id: string;
  title: string;
  location: string;
  starts_at: string;
  ends_at: string;
}
