import { useState } from 'react';
import { useImages } from './useApi';

export const useImageManager = () => {
  const [search, setSearch] = useState<string>('');

  const { images, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useImages(search);

  return {
    images,
    isLoading,
    search,
    setSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
