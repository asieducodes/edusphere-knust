export type NotificationType =
  | 'group_invite'
  | 'new_discussion_post'
  | 'session_reminder'
  | 'new_rating'
  | 'resource_upload';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}
