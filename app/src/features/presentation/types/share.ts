export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface SharedUser extends User {
  permission: 'read' | 'comment';
}

// Backend API response type (uses 'userId' instead of 'id')
export interface SharedUserApiResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  permission: 'read' | 'comment';
}

export interface ShareRequest {
  targetUserIds: string[];
  permission: 'read' | 'comment';
}

export interface ShareResponse {
  resourceId: string;
  successCount: number;
  failedCount: number;
}

export interface RevokeAccessRequest {
  targetUserId: string;
}

export type PermissionLevel = 'Viewer' | 'Commenter';

export interface ShareDialogData {
  users: User[];
  generalAccess: 'restricted' | 'anyone';
  anyonePermission: PermissionLevel;
}
