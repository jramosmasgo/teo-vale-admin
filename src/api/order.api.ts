import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { Order } from '../types/interfaces/order.interface';

export const orderApi = {
  getAll: async (filters?: { schedule?: string; days?: string[]; clientName?: string }) => {
    const params: any = {};
    
    if (filters?.schedule) {
      params.schedule = filters.schedule;
    }
    
    if (filters?.days && filters.days.length > 0) {
      params.days = filters.days.join(',');
    }
    
    if (filters?.clientName) {
      params.clientName = filters.clientName;
    }
    
    const response = await api.get<{ orders: Order[], total: number }>(API_ROUTES.ORDERS.GET_ALL, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Order>(API_ROUTES.ORDERS.GET_BY_ID(id));
    return response.data;
  },

  getByClient: async (clientId: string) => {
    const response = await api.get<Order[]>(API_ROUTES.ORDERS.GET_BY_CLIENT(clientId));
    return response.data;
  },

  create: async (order: Omit<Order, '_id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    console.log(order);
    const response = await api.post<Order>(API_ROUTES.ORDERS.CREATE, order);
    return response.data;
  },

  update: async (id: string, order: Partial<Order>) => {
    const response = await api.put<Order>(API_ROUTES.ORDERS.UPDATE(id), order);
    return response.data;
  },
};
