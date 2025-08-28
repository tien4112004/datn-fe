import { useQuery } from '@tanstack/react-query';
import { usePresentationApiService } from '../api';
import { useEffect, useState } from 'react';

export const usePresentationOutlines = () => {
  const presentationApiService = usePresentationApiService();
  const { data: outlineItems = [], ...query } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentationItems'],
    queryFn: async () => {
      const data = await presentationApiService.getOutlineItems();
      console.log('Fetch data', data);
      return data;
    },
  });

  return {
    outlineItems,
    ...query,
  };
};

export const usePresentations = () => {
  const presentationApiService = usePresentationApiService();

  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, ...query } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentations', sorting, pagination],
    queryFn: async () => {
      const data = await presentationApiService.getPresentations({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sort: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
      });
      return data;
    },
  });

  useEffect(() => {
    if (data && data.pagination) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: data.pagination?.currentPage ?? 0,
        pageSize: data.pagination?.pageSize ?? 20,
      }));
    }
  }, [data?.pagination]);

  return {
    data: data?.data || [],
    sorting,
    setSorting,
    pagination,
    setPagination,
    totalItems: data?.pagination?.totalItems || 0,
    ...query,
  };
};
