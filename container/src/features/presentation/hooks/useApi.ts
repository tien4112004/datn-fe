import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePresentationApiService } from '../api';
import type { OutlineItem } from '../types/outline';

export const usePresentationOutlines = () => {
  const presentationApiService = usePresentationApiService();
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);

  const {
    data: presentationItems,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [presentationApiService.getType(), 'presentationItems'],
    queryFn: async () => {
      const data = await presentationApiService.getPresentationItems();
      console.log('Fetch data', data);
      return data;
    },
  });

  useEffect(() => {
    if (presentationItems && presentationItems.length > 0) {
      setOutlineItems(presentationItems.map((item) => ({ id: item.id })));
    }
  }, [presentationItems]);

  return {
    outlineItems,
    setOutlineItems,
    isLoading,
    error,
    refetch,
  };
};
