import api from './ApiConfig';

export const analyticsApi = {
  // Orders analytics
  getTodayOrders: async () => {
    const response = await api.get('/analytics/orders/today');
    return response.data;
  },

  getOrdersUpdatedThisWeek: async () => {
    const response = await api.get('/analytics/orders/updated-this-week');
    return response.data;
  },

  // Payments analytics
  getTodayPaymentsTotal: async () => {
    const response = await api.get<{ total: number }>('/analytics/payments/today-total');
    return response.data;
  },

  // Clients analytics
  getClientsWithDebtCount: async () => {
    const response = await api.get<{ count: number }>('/analytics/clients/with-debt');
    return response.data;
  },

  // Shipments analytics
  getShipmentsCancelledThisWeek: async () => {
    const response = await api.get('/analytics/shipments/cancelled-this-week');
    return response.data;
  },

  getTotalUnpaidAmount: async () => {
    const response = await api.get<{ total: number }>('/analytics/shipments/total-unpaid');
    return response.data;
  },
};
