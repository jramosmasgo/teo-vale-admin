import type { User } from './user.interface';

export type ExpenseCategory =
  | 'HARINA'
  | 'MANTECA'
  | 'LENA'
  | 'SUELDO'
  | 'AGUA'
  | 'LUZ'
  | 'ARRIENDO'
  | 'OTRO';

export interface Expense {
  _id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  registeredBy: User | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
