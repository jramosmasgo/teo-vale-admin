import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { User } from '../types/interfaces/user.interface';

export const userApi = {
  getAll: async (page: number = 1, limit: number = 50) => {
    const params = { page, limit };
    const response = await api.get<{ users: User[], total: number }>(API_ROUTES.USERS.GET_ALL, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<User>(API_ROUTES.USERS.GET_BY_ID(id));
    return response.data;
  },

  login: async (credentials: Pick<User, 'email' | 'password'>) => {
    const response = await api.post(API_ROUTES.AUTH.LOGIN, credentials);
    return response.data;
  },

  create: async (user: Omit<User, '_id'>) => {
    const response = await api.post(API_ROUTES.USERS.CREATE, user);
    return response.data;
  },

  update: async (id: string, user: Partial<User>) => {
    const response = await api.put(API_ROUTES.USERS.UPDATE(id), user);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(API_ROUTES.USERS.DELETE(id));
    return response.data;
  },

   uploadProfileImage: async (id: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/users/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfileImage: async (id: string) => {
    const response = await api.delete(`/users/${id}/delete-image`);
    return response.data;
  },
};
