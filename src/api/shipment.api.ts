import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';
import type { Shipment } from '../types/interfaces/shipment.interface';

export const shipmentApi = {
  getAll: async (page: number = 1, limit: number = 15, filters: { paymentStatus?: string; status?: string; clientName?: string; deliveryDate?: string } = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get<{ shipments: Shipment[], total: number }>(API_ROUTES.SHIPMENTS.GET_ALL, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Shipment>(API_ROUTES.SHIPMENTS.GET_BY_ID(id));
    return response.data;
  },

  create: async (shipment: Omit<Shipment, '_id'>) => {
    const response = await api.post<Shipment>(API_ROUTES.SHIPMENTS.CREATE, shipment);
    return response.data;
  },

  update: async (id: string, shipment: Partial<Shipment>) => {
    const response = await api.put<Shipment>(API_ROUTES.SHIPMENTS.UPDATE(id), shipment);
    return response.data;
  },
  
  getByClient: async (clientId: string, page: number = 1, limit: number = 10, filters: { startDate?: string; endDate?: string; paymentStatus?: string } = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get<{ shipments: Shipment[], total: number, totalDebt: number, pendingCount: number }>(API_ROUTES.SHIPMENTS.GET_BY_CLIENT(clientId), { params });
    return response.data;
  },

  generateForOrder: async (orderId: string) => {
    const response = await api.post<{ success: boolean; message: string; alreadyExists?: boolean; shipment?: Shipment }>(
      API_ROUTES.SHIPMENTS.GENERATE_FOR_ORDER(orderId)
    );
    return response.data;
  },
};
