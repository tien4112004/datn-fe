import type { ApiClient } from '@aiprimary/api';
import type {
  PaymentApiService,
  CheckoutRequest,
  CheckoutResponse,
  TransactionDetails,
  UserCoin,
  CoinUsageTransaction,
  PaginationInfo,
} from '../types';

export default class PaymentService implements PaymentApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await this.apiClient.post<{ data: CheckoutResponse }>(
      `${this.baseUrl}/api/payments/checkout/create`,
      request
    );
    return response.data.data;
  }

  async getTransaction(transactionId: string): Promise<TransactionDetails> {
    const response = await this.apiClient.get<{ data: TransactionDetails }>(
      `${this.baseUrl}/api/payments/transaction/${transactionId}`
    );
    return response.data.data;
  }

  async getUserTransactions(
    page: number,
    size: number
  ): Promise<{ data: TransactionDetails[]; pagination: PaginationInfo }> {
    const response = await this.apiClient.get<{
      data: { data: TransactionDetails[]; pagination: PaginationInfo };
    }>(`${this.baseUrl}/api/payments/user/transactions`, {
      params: { page, size },
    });
    return response.data.data;
  }

  async getUserCoin(userId: string): Promise<UserCoin> {
    const response = await this.apiClient.get<UserCoin>(`${this.baseUrl}/api/payments/${userId}/coins`);
    return response.data;
  }

  async getCoinHistory(
    userId: string,
    page = 0,
    size = 20
  ): Promise<{ data: CoinUsageTransaction[]; pagination: PaginationInfo }> {
    const response = await this.apiClient.get<{
      data: CoinUsageTransaction[];
      pagination: PaginationInfo;
    }>(`${this.baseUrl}/api/payments/${userId}/history`, {
      params: { page, size },
    });
    return response.data;
  }
}
