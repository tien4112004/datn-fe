export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message?: string;
  errorCode?: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const mapPagination = (pagination: Pagination) => {
  return {
    currentPage: pagination.currentPage ? pagination.currentPage - 1 : 0,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
  };
};
