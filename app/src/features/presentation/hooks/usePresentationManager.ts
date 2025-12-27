import { useState } from 'react';
import { usePresentations, useUpdatePresentationTitle, useDeletePresentation } from './useApi';
import type { Presentation } from '../types/presentation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const usePresentationManager = () => {
  const { t } = useTranslation('common', { keyPrefix: 'table.presentation' });
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const updatePresentationTitle = useUpdatePresentationTitle();
  const deletePresentation = useDeletePresentation();

  const { data, isLoading, sorting, setSorting, pagination, setPagination, totalItems, search, setSearch } =
    usePresentations();

  const handleRename = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsRenameOpen(true);
  };

  const handleConfirmRename = async (id: string, newName: string) => {
    await updatePresentationTitle.mutateAsync({ id, name: newName });
  };

  const handleDelete = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPresentation) return;

    try {
      await deletePresentation.mutateAsync(selectedPresentation.id);
      toast.success(t('deleteSuccess', { name: selectedPresentation.title }));
      setIsDeleteOpen(false);
      setSelectedPresentation(null);
    } catch (error) {
      toast.error(t('deleteError'));
      console.error('Failed to delete presentation:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteOpen(false);
    setSelectedPresentation(null);
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
    // Delete Dialog
    isDeleteOpen,
    setIsDeleteOpen,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    isDeletePending: deletePresentation.isPending,
  };
};
