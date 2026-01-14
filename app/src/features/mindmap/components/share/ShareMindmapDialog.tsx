import { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2, Eye, MessageSquare, Lock, Globe, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useMindmapApiService } from '../../api';
import { useUserProfileApiService } from '@/features/user/api';
import type { User, PermissionLevel } from '../../types/share';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

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
  const apiService = useMindmapApiService();
  const userService = useUserProfileApiService();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserWithPermission[]>([]);
  const [isLoadingSharedUsers, setIsLoadingSharedUsers] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [generalAccess, setGeneralAccess] = useState<'restricted' | 'anyone'>('restricted');
  const [anyoneDefaultPermission, setAnyoneDefaultPermission] = useState<PermissionLevel>('Viewer');

  // Permission options configuration
  const permissionOptions: PermissionOption[] = [
    {
      value: 'Viewer',
      label: 'Viewer',
      description: 'Can view only',
      icon: Eye,
    },
    {
      value: 'Commenter',
      label: 'Commenter',
      description: 'Can view and comment',
      icon: MessageSquare,
    },
  ];

  // General access options configuration
  const generalAccessOptions: GeneralAccessOption[] = [
    {
      value: 'restricted',
      label: 'Restricted',
      description: 'Only people with access can open',
      icon: Lock,
    },
    {
      value: 'anyone',
      label: 'Anyone with the link',
      description: 'Anyone on the internet can view',
      icon: Globe,
    },
  ];

  // Load existing shared users when dialog opens
  useEffect(() => {
    if (isOpen && mindmapId) {
      loadSharedUsers();
    }
  }, [isOpen, mindmapId]);

  const loadSharedUsers = async () => {
    setIsLoadingSharedUsers(true);
    try {
      const sharedUsers = await apiService.getSharedUsers(mindmapId);
      const usersWithPermissions: UserWithPermission[] = sharedUsers.map((user) => ({
        id: user.userId, // Backend returns 'userId', map to 'id'
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        permission: user.permission === 'read' ? 'Viewer' : 'Commenter',
      }));
      setSelectedUsers(usersWithPermissions);
    } catch (error) {
      console.error('Failed to load shared users:', error);
      toast.error('Failed to load shared users');
    } finally {
      setIsLoadingSharedUsers(false);
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
          toast.error('Failed to search users');
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
    setSearchResults([]);

    // Immediately share with the user
    try {
      await apiService.shareMindmap(mindmapId, {
        targetUserIds: [user.id],
        permission: 'read',
      });
      toast.success('User added', {
        description: `${user.firstName} ${user.lastName} can now view this mindmap`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
      // Revert on error
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      toast.error('Failed to share', {
        description: 'Could not add user to mindmap',
      });
    }
  };

  const removeUser = async (userId: string) => {
    const user = selectedUsers.find((u) => u.id === userId);
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));

    try {
      await apiService.revokeAccess(mindmapId, userId);
      toast.success('Access revoked', {
        description: `${user?.firstName} ${user?.lastName} no longer has access`,
      });
    } catch (error) {
      console.error('Failed to revoke access:', error);
      // Revert on error
      if (user) setSelectedUsers([...selectedUsers]);
      toast.error('Failed to revoke access', {
        description: 'Could not remove user from mindmap',
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
      toast.success('Permission updated', {
        description: `User is now a ${newPermission}`,
      });
    } catch (error) {
      console.error('Failed to update permission:', error);
      // Revert on error
      updatedUsers[userIndex].permission = oldPermission;
      setSelectedUsers(updatedUsers);
      toast.error('Failed to update permission', {
        description: 'Could not change user permission',
      });
    }
  };

  const copyLink = () => {
    const link = window.location.origin + `/mindmap/${mindmapId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied', {
      description: 'Mindmap link copied to clipboard',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const currentAccessOption =
    generalAccessOptions.find((option) => option.value === generalAccess) || generalAccessOptions[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[540px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Share mindmap</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add People Section */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
            {searchResults.length > 0 && (
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
          </div>

          {/* People with Access */}
          {isLoadingSharedUsers ? (
            <div className="space-y-2">
              <h4 className="mb-3 text-sm font-medium">People with access</h4>
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
              <h4 className="mb-3 text-sm font-medium">People with access</h4>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          {user.permission}
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => removeUser(user.id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600"
                        >
                          <X className="h-4 w-4" />
                          Remove access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* General Access Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-3 text-sm font-medium">General access</h4>

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
                      onClick={() => setGeneralAccess(option.value)}
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
                      <span>{anyoneDefaultPermission}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {permissionOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setAnyoneDefaultPermission(option.value)}
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
            Copy link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
