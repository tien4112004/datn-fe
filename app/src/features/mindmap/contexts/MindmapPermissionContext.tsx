import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Permission } from '@/shared/utils/permission';

interface MindmapPermissionContextValue {
  // Core state
  isPresenterMode: boolean;
  userPermission: Permission | undefined;

  // Derived capabilities
  canEdit: boolean;
  canComment: boolean;
  isReadOnly: boolean;
}

const MindmapPermissionContext = createContext<MindmapPermissionContextValue>({
  isPresenterMode: false,
  userPermission: undefined,
  canEdit: false,
  canComment: false,
  isReadOnly: true,
});

export const MindmapPermissionProvider = ({
  children,
  isPresenterMode,
  userPermission,
}: {
  children: ReactNode;
  isPresenterMode: boolean;
  userPermission: Permission | undefined;
}) => {
  const value = useMemo<MindmapPermissionContextValue>(() => {
    const canEdit = userPermission === 'edit' && !isPresenterMode;
    const canComment = (userPermission === 'comment' || userPermission === 'edit') && !isPresenterMode;
    const isReadOnly = userPermission === 'read' || !userPermission || isPresenterMode;

    return {
      isPresenterMode,
      userPermission,
      canEdit,
      canComment,
      isReadOnly,
    };
  }, [isPresenterMode, userPermission]);

  return <MindmapPermissionContext.Provider value={value}>{children}</MindmapPermissionContext.Provider>;
};

export const useMindmapPermissionContext = () => {
  const context = useContext(MindmapPermissionContext);
  if (!context) {
    throw new Error('useMindmapPermissionContext must be used within MindmapPermissionProvider');
  }
  return context;
};
