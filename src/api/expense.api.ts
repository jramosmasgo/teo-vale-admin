import api from './ApiConfig';
import type { Expense } from '../types/interfaces/expense.interface';

export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  registeredBy?: string;
}

export const expenseApi = {
  getAll: async (page: number = 1, limit: number = 15, filters: ExpenseFilters = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get<{ expenses: Expense[], total: number, totalAmount: number }>(
      '/expenses',
      { params }
    );
    return response.data;
  },

  getSummary: async (startDate?: string, endDate?: string) => {
    const params = { startDate, endDate };
    const response = await api.get<{ category: string, total: number, count: number }[]>(
      '/expenses/summary',
      { params }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Expense>) => {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/expenses/${id}`);
    return response.data;
  }
};
