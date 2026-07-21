/**
 * EduSphere — services/notificationService.ts
 * -----------------------------------------------------------------------
 * Wraps /notifications endpoints — matches the notification bell (with
 * its unread dot) shown on Home/Groups/Resources screen headers.
 * -----------------------------------------------------------------------
 */

import api from './api';
import { ApiResponse, PaginatedData, PaginationParams } from '../types/api';
import { AppNotification } from '../types/notification';

/** GET /notifications */
export async function getNotifications(
  params?: PaginationParams
): Promise<ApiResponse<PaginatedData<AppNotification>>> {
  const response = await api.get<ApiResponse<PaginatedData<AppNotification>>>('/notifications', { params });
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

/** POST /profile/push-token — registers this device for push delivery. */
export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/profile/push-token', { token, platform });
  return response.data;
}

/** DELETE /profile/push-token — called on logout so a signed-out device
 *  stops receiving push for whoever's no longer using it here. */
export async function unregisterPushToken(token: string): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>('/profile/push-token', { data: { token } });
  return response.data;
}
