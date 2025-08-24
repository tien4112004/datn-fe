export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message?: string;
  errorCode?: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
