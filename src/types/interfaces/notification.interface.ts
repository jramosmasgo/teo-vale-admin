import type { User } from './user.interface';

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_CANCELLED'
  | 'CLIENT_CREATED'
  | 'SHIPMENT_CANCELLED'
  | 'SHIPMENT_UPDATED';

export interface Notification {
  _id: string;
  createdBy: User | string;
  type: NotificationType;
  title: string;
  content: string;
  seenBy: string[];
  action?: {
    entityId?: string;
    entityType?: string;
  };
  createdAt: string;
  updatedAt: string;
}
