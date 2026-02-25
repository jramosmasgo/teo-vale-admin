import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { Notification } from '../types/interfaces/notification.interface';

export const notificationApi = {
  getAll: async (page: number = 1, limit: number = 20) => {
    const params = { page, limit };
    const response = await api.get<{ notifications: Notification[], total: number, unread: number }>(
      API_ROUTES.NOTIFICATIONS.GET_ALL,
      { params }
    );
    return response.data;
  },

  markAsSeen: async (id: string) => {
    const response = await api.patch<Notification>(API_ROUTES.NOTIFICATIONS.MARK_AS_SEEN(id));
    return response.data;
  },

  markAllAsSeen: async () => {
    const response = await api.patch<{ message: string }>(API_ROUTES.NOTIFICATIONS.MARK_ALL_AS_SEEN);
    return response.data;
  },

  cleanup: async () => {
    const response = await api.delete<{ message: string, deleted: number }>(API_ROUTES.NOTIFICATIONS.CLEANUP);
    return response.data;
  }
};
