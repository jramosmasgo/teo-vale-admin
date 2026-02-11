import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { Payment } from '../types/interfaces/payment.interface';

export const paymentApi = {
  getAll: async () => {
    const response = await api.get<Payment[]>(API_ROUTES.PAYMENTS.GET_ALL);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Payment>(API_ROUTES.PAYMENTS.GET_BY_ID(id));
    return response.data;
  },

  create: async (payment: Omit<Payment, '_id'>) => {
    const response = await api.post<Payment>(API_ROUTES.PAYMENTS.CREATE, payment);
    return response.data;
  },

  update: async (id: string, payment: Partial<Payment>) => {
    const response = await api.put<Payment>(API_ROUTES.PAYMENTS.UPDATE(id), payment);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(API_ROUTES.PAYMENTS.DELETE(id));
    return response.data;
  },
};
