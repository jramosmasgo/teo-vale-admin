import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';

export const qrApi = {
  getByToken: async (token: string) => {
    const response = await api.get(API_ROUTES.QR.GET_BY_TOKEN(token));
    return response.data;
  },
  
  getClientQr: async (clientId: string) => {
    const response = await api.get(API_ROUTES.QR.GET_CLIENT_QR(clientId));
    return response.data;
  },
};
