import type { Client } from './client.interface';
import type { User } from './user.interface';

export interface Payment {
  _id?: string;
  client?: string | Client;
  amountPaid?: number;
  paymentDate?: string;
  paymentTime?: string;
  paymentCode?: string;
  registeredBy?: string | User;
  shipments?: Array<{
    shipment: string;
    amountApplied: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}
