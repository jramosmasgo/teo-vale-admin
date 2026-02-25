import type { Client } from './client.interface';

export interface OrderItem {
  name: string;
  price: number;
}

export interface Order {
  _id?: string;
  orderCode?: string;
  client?: string | Client;
  orderDays?: string[];
  schedule?: string;
  amount?: number;
  items?: OrderItem[];
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
