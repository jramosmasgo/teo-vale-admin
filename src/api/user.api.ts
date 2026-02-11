import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { User } from '../types/interfaces/user.interface';

export const userApi = {
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
};
