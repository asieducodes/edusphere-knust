/**
 * EduSphere — types/notification.ts
 * -----------------------------------------------------------------------
 * Notification shapes — matches the notification bell shown on
 * HomeScreen/GroupsScreen/ResourcesScreen headers.
 * -----------------------------------------------------------------------
 */

export type NotificationType =
  | 'group_invite'
  | 'discussion_reply'
  | 'session_reminder'
  | 'resource_upload'
  | 'rating_received'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  /** Extra payload for deep-linking, e.g. { groupId: '...' } — shape
   *  varies by notification type, so this stays loosely typed. */
  data?: Record<string, unknown>;
}
