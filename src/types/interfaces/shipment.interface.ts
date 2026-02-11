import type { Order } from './order.interface';
import type { Client } from './client.interface';

export interface Shipment {
  _id?: string;
  order?: Order;
  client?: Client;
  status?: string;
  amount?: number;
  isPaid?: boolean;
  deliveryDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
