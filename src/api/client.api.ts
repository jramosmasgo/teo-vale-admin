import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { Client } from '../types/interfaces/client.interface';

export const clientApi = {
  getAll: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get<Client[]>(API_ROUTES.CLIENTS.GET_ALL, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Client>(API_ROUTES.CLIENTS.GET_BY_ID(id));
    return response.data;
  },

  create: async (client: Omit<Client, '_id'>) => {
    const response = await api.post<Client>(API_ROUTES.CLIENTS.CREATE, client);
    return response.data;
  },

  update: async (id: string, client: Partial<Client>) => {
    const response = await api.put<Client>(API_ROUTES.CLIENTS.UPDATE(id), client);
    return response.data;
  },

  uploadProfileImage: async (id: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/clients/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfileImage: async (id: string) => {
    const response = await api.delete(`/clients/${id}/delete-image`);
    return response.data;
  },
};
