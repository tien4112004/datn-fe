import { useState } from 'react';
import { usePresentations, useUpdatePresentationTitle } from './useApi';
import type { Presentation } from '../types/presentation';

export const usePresentationManager = () => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const updatePresentationTitle = useUpdatePresentationTitle();

  const { data, isLoading, sorting, setSorting, pagination, setPagination, totalItems, search, setSearch } =
    usePresentations();

  const handleRename = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsRenameOpen(true);
  };

  const handleConfirmRename = async (id: string, newName: string) => {
    await updatePresentationTitle.mutateAsync({ id, name: newName });
  };

  return {
    // Data
    data,
    isLoading,
    totalItems,
    search,
    setSearch,
    // Sorting & Pagination
    sorting,
    setSorting,
    pagination,
    setPagination,
    // Rename Dialog
    isRenameOpen,
    setIsRenameOpen,
    selectedPresentation,
    setSelectedPresentation,
    handleRename,
    handleConfirmRename,
    isRenamePending: updatePresentationTitle.isPending,
  };
};
