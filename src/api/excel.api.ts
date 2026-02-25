import api from './ApiConfig';
import { API_ROUTES } from '../types/api.routes';

/** Generic helper: calls the endpoint and triggers a browser download */
async function downloadBlob(url: string, params: Record<string, string>, filename: string) {
  const response = await api.get(url, {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export const excelApi = {
  /**
   * Descarga el reporte de pagos.
   * @param filters  paymentDate (YYYY-MM-DD) | startDate + endDate
   */
  downloadPayments: async (filters: {
    paymentDate?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params: Record<string, string> = {};
    if (filters.paymentDate) params.paymentDate = filters.paymentDate;
    if (filters.startDate)   params.startDate   = filters.startDate;
    if (filters.endDate)     params.endDate     = filters.endDate;

    const date = filters.paymentDate ?? filters.startDate ?? new Date().toISOString().split('T')[0];
    await downloadBlob(API_ROUTES.EXCEL.PAYMENTS, params, `reporte-pagos-${date}.xlsx`);
  },

  /**
   * Descarga el reporte de entregas.
   * @param filters  deliveryDate | startDate + endDate | paymentStatus | status
   */
  downloadDeliveries: async (filters: {
    deliveryDate?: string;
    startDate?: string;
    endDate?: string;
    paymentStatus?: string;
    status?: string;
  }) => {
    const params: Record<string, string> = {};
    if (filters.deliveryDate)  params.deliveryDate  = filters.deliveryDate;
    if (filters.startDate)     params.startDate     = filters.startDate;
    if (filters.endDate)       params.endDate       = filters.endDate;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.status)        params.status        = filters.status;

    const date = filters.deliveryDate ?? filters.startDate ?? new Date().toISOString().split('T')[0];
    await downloadBlob(API_ROUTES.EXCEL.DELIVERIES, params, `reporte-entregas-${date}.xlsx`);
  },
};
