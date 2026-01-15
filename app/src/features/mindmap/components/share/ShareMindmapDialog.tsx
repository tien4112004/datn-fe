import { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, Eye, MessageSquare, Lock, Globe, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useMindmapApiService } from '../../api';
import { useUserProfileApiService } from '@/features/user/api';
import type { User, PermissionLevel } from '../../types/share';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ShareMindmapDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mindmapId: string;
}

interface UserWithPermission extends User {
  permission: PermissionLevel;
}

interface PermissionOption {
  value: PermissionLevel;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface GeneralAccessOption {
  value: 'restricted' | 'anyone';
  label: string;
  description: string;
  icon: LucideIcon;
}

export default function ShareMindmapDialog({ isOpen, onOpenChange, mindmapId }: ShareMindmapDialogProps) {
  const { t } = useTranslation('mindmap');
  const apiService = useMindmapApiService();
  const userService = useUserProfileApiService();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserWithPermission[]>([]);
  const [isLoadingShareState, setIsLoadingShareState] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [generalAccess, setGeneralAccess] = useState<'restricted' | 'anyone'>('restricted');
  const [anyoneDefaultPermission, setAnyoneDefaultPermission] = useState<PermissionLevel>('Viewer');

  // Permission options configuration
  const permissionOptions: PermissionOption[] = [
    {
      value: 'Viewer',
      label: t('share.permissions.viewer'),
      description: t('share.permissions.viewerDescription'),
      icon: Eye,
    },
    {
      value: 'Commenter',
      label: t('share.permissions.commenter'),
      description: t('share.permissions.commenterDescription'),
      icon: MessageSquare,
    },
  ];

  // General access options configuration
  const generalAccessOptions: GeneralAccessOption[] = [
    {
      value: 'restricted',
      label: t('share.access.restricted'),
      description: t('share.access.restrictedDescription'),
      icon: Lock,
    },
    {
      value: 'anyone',
      label: t('share.access.anyone'),
      description: t('share.access.anyoneDescription'),
      icon: Globe,
    },
  ];

  // Load share state when dialog opens
  useEffect(() => {
    if (isOpen && mindmapId) {
      loadShareState();
    }
  }, [isOpen, mindmapId]);

  const loadShareState = async () => {
    setIsLoadingShareState(true);
    try {
      const shareState = await apiService.getShareState(mindmapId);

      // Map shared users
      const usersWithPermissions: UserWithPermission[] = shareState.sharedUsers.map((user) => ({
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        permission: user.permission === 'read' ? 'Viewer' : 'Commenter',
      }));
      setSelectedUsers(usersWithPermissions);

      // Set public access state
      setGeneralAccess(shareState.publicAccess.isPublic ? 'anyone' : 'restricted');
      if (shareState.publicAccess.isPublic && shareState.publicAccess.publicPermission) {
        setAnyoneDefaultPermission(
          shareState.publicAccess.publicPermission === 'read' ? 'Viewer' : 'Commenter'
        );
      }

      // Warn if user doesn't have edit permission
      if (shareState.currentUserPermission !== 'edit') {
        console.warn('User does not have edit permission');
        toast.warning(t('share.messages.limitedAccess'), {
          description: t('share.messages.limitedAccessDescription'),
        });
      }
    } catch (error) {
      console.error('Failed to load share state:', error);
      toast.error(t('share.errors.failedToLoadShareState'));
    } finally {
      setIsLoadingShareState(false);
    }
  };

  // Debounced user search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const users = await userService.searchUsers(searchQuery);
          // Filter out already selected users
          const filtered = users.filter((user) => !selectedUsers.some((selected) => selected.id === user.id));
          setSearchResults(filtered);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
          toast.error(t('share.errors.failedToSearch'));
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedUsers]);

  const addUser = async (user: User) => {
    const newUser: UserWithPermission = { ...user, permission: 'Viewer' };
    setSelectedUsers([...selectedUsers, newUser]);
    setSearchQuery('');
    setShowSearchDropdown(false);

    // Immediately share with the user
    try {
      await apiService.shareMindmap(mindmapId, {
        targetUserIds: [user.id],
        permission: 'read',
      });
      toast.success(t('share.messages.userAdded'), {
        description: t('share.messages.userAddedDescription', { name: `${user.firstName} ${user.lastName}` }),
      });
    } catch (error) {
      console.error('Failed to share:', error);
      // Revert on error
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      toast.error(t('share.errors.failedToShare'), {
        description: t('share.errors.failedToShareDescription'),
      });
    }
  };

  const removeUser = async (userId: string) => {
    const user = selectedUsers.find((u) => u.id === userId);
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));

    try {
      await apiService.revokeAccess(mindmapId, userId);
      toast.success(t('share.messages.accessRevoked'), {
        description: t('share.messages.accessRevokedDescription', {
          name: `${user?.firstName} ${user?.lastName}`,
        }),
      });
    } catch (error) {
      console.error('Failed to revoke access:', error);
      // Revert on error
      if (user) setSelectedUsers([...selectedUsers]);
      toast.error(t('share.errors.failedToRevoke'), {
        description: t('share.errors.failedToRevokeDescription'),
      });
    }
  };

  const updateUserPermission = async (userId: string, newPermission: PermissionLevel) => {
    const userIndex = selectedUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) return;

    const oldPermission = selectedUsers[userIndex].permission;
    const updatedUsers = [...selectedUsers];
    updatedUsers[userIndex].permission = newPermission;
    setSelectedUsers(updatedUsers);

    try {
      await apiService.shareMindmap(mindmapId, {
        targetUserIds: [userId],
        permission: newPermission === 'Viewer' ? 'read' : 'comment',
      });
      toast.success(t('share.messages.permissionUpdated'), {
        description: t('share.messages.permissionUpdatedDescription', { permission: newPermission }),
      });
    } catch (error) {
      console.error('Failed to update permission:', error);
      // Revert on error
      updatedUsers[userIndex].permission = oldPermission;
      setSelectedUsers(updatedUsers);
      toast.error(t('share.errors.failedToUpdate'), {
        description: t('share.errors.failedToUpdateDescription'),
      });
    }
  };

  const setGeneralAccessWithApi = async (value: 'restricted' | 'anyone') => {
    const isPublic = value === 'anyone';
    const permission = anyoneDefaultPermission === 'Viewer' ? 'read' : 'comment';

    try {
      await apiService.setPublicAccess(mindmapId, {
        isPublic,
        publicPermission: isPublic ? permission : 'read',
      });

      setGeneralAccess(value);
      toast.success(t('share.messages.accessUpdated'), {
        description: isPublic ? t('share.messages.accessPublic') : t('share.messages.accessRestricted'),
      });
    } catch (error) {
      console.error('Failed to update public access:', error);
      toast.error(t('share.errors.failedToUpdateAccess'));
    }
  };

  const setAnyonePermissionWithApi = async (permission: PermissionLevel) => {
    // Only persist if currently set to 'anyone'
    if (generalAccess !== 'anyone') {
      setAnyoneDefaultPermission(permission);
      return;
    }

    const publicPermission = permission === 'Viewer' ? 'read' : 'comment';

    try {
      await apiService.setPublicAccess(mindmapId, {
        isPublic: true,
        publicPermission,
      });

      setAnyoneDefaultPermission(permission);
      toast.success(t('share.messages.permissionUpdated'));
    } catch (error) {
      console.error('Failed to update permission:', error);
      toast.error(t('share.errors.failedToUpdate'));
    }
  };

  const copyLink = () => {
    const link = window.location.origin + `/mindmap/${mindmapId}?view=true`;
    navigator.clipboard.writeText(link);
    toast.success(t('share.messages.linkCopied'), {
      description: t('share.messages.linkCopiedDescription'),
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getPermissionLabel = (permission: PermissionLevel) => {
    return permission === 'Viewer' ? t('share.permissions.viewer') : t('share.permissions.commenter');
  };

  const currentAccessOption =
    generalAccessOptions.find((option) => option.value === generalAccess) || generalAccessOptions[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[540px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add People Section */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('share.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => {
                // Delay hiding to allow clicks on dropdown items to complete
                setTimeout(() => {
                  setShowSearchDropdown(false);
                }, 100);
              }}
              className="pl-9 pr-9"
            />
            {searchQuery && !isSearching && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => addUser(user)}
                    className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSearchDropdown && searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white p-4 text-sm text-gray-500">
                {t('share.noUsersFound')}
              </div>
            )}
          </div>

          {/* People with Access */}
          {isLoadingShareState ? (
            <div className="space-y-2">
              <h4 className="mb-3 text-sm font-medium">{t('share.peopleWithAccess')}</h4>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-2 w-48 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedUsers.length > 0 ? (
            <div className="space-y-2">
              <h4 className="mb-3 text-sm font-medium">{t('share.peopleWithAccess')}</h4>
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 py-1.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            {getPermissionLabel(user.permission)}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          {permissionOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => updateUserPermission(user.id, option.value)}
                              className="flex items-start gap-3 px-4 py-3"
                            >
                              <option.icon className="mt-0.5 h-4 w-4 text-gray-500" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{option.label}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                              {user.permission === option.value && <Check className="text-primary h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUser(user.id)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* General Access Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-3 text-sm font-medium">{t('share.generalAccess')}</h4>

            <div className="flex items-start gap-3">
              {/* General Access Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-auto flex-1 items-start justify-start p-3 text-left">
                    <div className="flex w-full items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <currentAccessOption.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{currentAccessOption.label}</div>
                        <div className="text-xs text-gray-500">{currentAccessOption.description}</div>
                      </div>
                      <ChevronDown className="mt-1 h-4 w-4 flex-shrink-0" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  {generalAccessOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setGeneralAccessWithApi(option.value)}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <option.icon className="mt-0.5 h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                      {generalAccess === option.value && <Check className="text-primary h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Anyone Default Permission Selector */}
              {generalAccess === 'anyone' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex h-auto items-center gap-2 whitespace-nowrap px-3 py-2"
                    >
                      {anyoneDefaultPermission === 'Viewer' ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      <span>{getPermissionLabel(anyoneDefaultPermission)}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {permissionOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setAnyonePermissionWithApi(option.value)}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <option.icon className="mt-0.5 h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                        {anyoneDefaultPermission === option.value && (
                          <Check className="text-primary h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Copy Link */}
          <Button onClick={copyLink} className="w-full font-medium">
            {t('share.copyLink')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
