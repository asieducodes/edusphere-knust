/**
 * EduSphere — services/notificationService.ts
 * -----------------------------------------------------------------------
 * Wraps /notifications endpoints — matches the notification bell (with
 * its unread dot) shown on Home/Groups/Resources screen headers.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginationParams } from '../types/api';
import { AppNotification } from '../types/notification';

/** GET /notifications */
export async function getNotifications(params?: PaginationParams): Promise<ApiResponse<AppNotification[]>> {
  const response = await api.get<ApiResponse<AppNotification[]>>('/notifications', { params });
  return response.data;
}

/** PATCH /notifications/:notificationId/read */
export async function markNotificationRead(notificationId: string): Promise<ApiResponse<AppNotification>> {
  const response = await api.patch<ApiResponse<AppNotification>>(`/notifications/${notificationId}/read`);
  return response.data;
}

/** PATCH /notifications/read-all */
export async function markAllNotificationsRead(): Promise<ApiResponse<null>> {
  const response = await api.patch<ApiResponse<null>>('/notifications/read-all');
  return response.data;
}
