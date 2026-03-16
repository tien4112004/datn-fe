export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PROCESSING' | 'REFUNDED';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  referenceCode: string;
  status: TransactionStatus;
  gate: string;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface TransactionQueryParams {
  page?: number;
  size?: number;
  status?: TransactionStatus;
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
