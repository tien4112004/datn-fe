export type PaymentGate = 'SEPAY' | 'PAYOS';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PROCESSING' | 'REFUNDED';

export interface CheckoutRequest {
  amount: number;
  description: string;
  gate: PaymentGate;
  referenceCode?: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  transactionId: string;
  orderInvoiceNumber: string;
  gate: string;
  checkoutUrl: string;
  formFields: Record<string, string>;
  referenceCode: string;
  amount: number;
  status: string;
}

export interface TransactionDetails {
  id: string;
  amount: number;
  description: string;
  referenceCode: string;
  status: TransactionStatus;
  gate: string;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface UserCoin {
  id: string;
  coin: number;
}

export interface CoinUsageTransaction {
  id: string;
  userId: string;
  createdAt: string;
  type: string;
  source: string;
  amount: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface PaymentApiService {
  createCheckout(request: CheckoutRequest): Promise<CheckoutResponse>;
  getTransaction(transactionId: string): Promise<TransactionDetails>;
  getUserTransactions(
    page: number,
    size: number
  ): Promise<{ data: TransactionDetails[]; pagination: PaginationInfo }>;
  getUserCoin(userId: string): Promise<UserCoin>;
  getCoinHistory(
    userId: string,
    page?: number,
    size?: number
  ): Promise<{ data: CoinUsageTransaction[]; pagination: PaginationInfo }>;
}
