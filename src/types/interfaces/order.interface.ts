import type { Client } from './client.interface';

export interface Order {
  _id?: string;
  orderCode?: string;
  client?: string | Client;
  orderDays?: string[];
  schedule?: string;
  amount?: number;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
