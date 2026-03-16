export interface AdminStats {
  totalTokens: number | null;
  totalRequests: number | null;
  totalRevenue: number | null;
  totalTransactions: number | null;
  userRegistrationsByMonth: { month: string; count: number }[];
  tokenUsageByMonth: { month: string; tokens: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}
