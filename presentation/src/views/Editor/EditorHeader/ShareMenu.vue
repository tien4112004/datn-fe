<template>
  <div class="tw-bg-white tw-rounded-lg tw-shadow-xl tw-w-[540px] tw-max-h-[400px] tw-flex tw-flex-col">
    <!-- Header -->
    <div class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
      <h2 class="tw-text-xl tw-font-normal tw-text-gray-900 tw-m-0">{{ t('header.shareMenu.title') }}</h2>
    </div>
    <!-- Content -->
    <div class="tw-flex-1 tw-overflow-y-auto tw-px-6 tw-py-4">
      <!-- Add People Section -->
      <div class="tw-mb-6">
        <div class="tw-relative">
          <Input
            v-model:value="searchQuery"
            :placeholder="t('header.shareMenu.addPeople')"
            class="tw-w-full tw-px-4 tw-py-2.5 tw-pr-20 tw-text-sm tw-border tw-border-gray-300 tw-rounded tw-outline-none focus:tw-border-blue-500 focus:tw-ring-1 focus:tw-ring-blue-500"
          />

          <!-- Loading spinner for search -->
          <div v-if="isSearching" class="tw-absolute tw-right-3 tw-top-3">
            <div
              class="tw-animate-spin tw-h-4 tw-w-4 tw-border-2 tw-border-blue-500 tw-border-t-transparent tw-rounded-full"
            ></div>
          </div>

          <!-- Search Results Dropdown -->
          <div
            v-if="searchResults.length > 0"
            class="tw-absolute tw-top-full tw-left-0 tw-right-0 tw-mt-1 tw-bg-white tw-border tw-border-gray-300 tw-rounded tw-shadow-lg tw-z-10 tw-max-h-64 tw-overflow-y-auto"
          >
            <div
              v-for="user in searchResults"
              :key="user.id"
              @click="addUser(user)"
              class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-cursor-pointer"
            >
              <div
                class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-blue-500 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-sm tw-font-medium"
              >
                {{ getInitials(user.name) }}
              </div>
              <div class="tw-flex-1">
                <div class="tw-text-sm tw-font-normal tw-text-gray-900">{{ user.name }}</div>
                <div class="tw-text-xs tw-text-muted-foreground">{{ user.email }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- People with Access -->
      <div v-if="isLoadingSharedUsers" class="tw-mb-6">
        <h3 class="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">
          {{ t('header.shareMenu.peopleWithAccess') }}
        </h3>
        <div class="tw-space-y-2">
          <div v-for="i in 3" :key="i" class="tw-flex tw-items-center tw-gap-3 tw-py-1.5">
            <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-gray-200 tw-animate-pulse"></div>
            <div class="tw-flex-1 tw-space-y-2">
              <div class="tw-h-3 tw-w-32 tw-bg-gray-200 tw-animate-pulse tw-rounded"></div>
              <div class="tw-h-2 tw-w-48 tw-bg-gray-200 tw-animate-pulse tw-rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="selectedUsers.length > 0" class="tw-mb-6">
        <h3 class="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">
          {{ t('header.shareMenu.peopleWithAccess') }}
        </h3>
        <div class="tw-space-y-2">
          <div
            v-for="user in selectedUsers"
            :key="user.id"
            class="tw-flex tw-items-center tw-gap-3 tw-py-1.5"
          >
            <div
              class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-purple-500 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-sm tw-font-medium"
            >
              {{ getInitials(user.name) }}
            </div>
            <div class="tw-flex-1 tw-min-w-0">
              <div class="tw-text-sm tw-font-normal tw-text-gray-900">{{ user.name }}</div>
              <div class="tw-text-xs tw-text-muted-foreground tw-truncate">{{ user.email }}</div>
            </div>
            <Popover trigger="click" placement="bottom" v-model:value="permissionPopoverOpen[user.id]">
              <template #content>
                <div class="tw-flex tw-flex-col tw-space-y-1 tw-p-2">
                  <Button
                    v-for="permission in userPermissions"
                    :key="permission.value"
                    @click="updateUserPermission(user.id, permission.value)"
                    class="tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
                  >
                    <component :is="permission.icon" class="tw-text-muted-foreground" />
                    <div class="tw-flex-1 tw-text-left">
                      <div class="tw-text-sm tw-font-medium tw-text-gray-900">{{ permission.label }}</div>
                      <div class="tw-text-xs tw-text-muted-foreground">{{ permission.description }}</div>
                    </div>
                    <IconCheckOne v-if="user.permission === permission.value" class="tw-text-primary" />
                  </Button>
                </div>
              </template>

              <Button
                class="tw-px-3 tw-py-1.5 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-font-medium tw-text-gray-900 hover:tw-bg-gray-50 tw-transition-colors tw-flex tw-items-center tw-gap-1"
              >
                <component
                  :is="getPermissionIcon(user?.permission || 'Viewer')"
                  class="tw-text-muted-foreground"
                />
                {{ user.permission || 'Viewer' }}
                <IconDown />
              </Button>
            </Popover>
            <Button
              @click="removeUser(user.id)"
              class="tw-text-gray-400 hover:tw-text-muted-foreground tw-p-1"
            >
              <IconClose />
            </Button>
          </div>
        </div>
      </div>

      <!-- General Access -->
      <div class="tw-border-t tw-border-gray-200 tw-pt-4">
        <h3 class="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">
          {{ t('header.shareMenu.generalAccess') }}
        </h3>

        <div class="tw-flex tw-gap-4 tw-items-stretch">
          <Popover
            trigger="click"
            trigger-class="tw-flex-1"
            placement="bottom"
            v-model:value="generalAccessPopoverOpen"
          >
            <template #content>
              <Button
                v-for="option in generalAccessOptions"
                :key="option.value"
                @click="setGeneralAccess(option.value)"
                class="tw-w-full tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
              >
                <component :is="option.icon" class="tw-text-muted-foreground" />
                <div class="tw-flex-1 tw-text-left">
                  <div class="tw-text-sm tw-font-medium tw-text-gray-900">{{ option.label }}</div>
                  <div class="tw-text-xs tw-text-muted-foreground">{{ option.description }}</div>
                </div>
                <IconCheckOne v-if="generalAccess === option.value" class="tw-text-primary" />
              </Button>
            </template>

            <Button
              class="tw-w-full tw-h-fit tw-flex tw-items-center tw-gap-3 tw-p-3 tw-border tw-border-gray-300 tw-rounded hover:tw-bg-gray-50 tw-transition-colors"
            >
              <div
                class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-gray-100 tw-flex tw-items-center tw-justify-center"
              >
                <component :is="currentAccessOption.icon" class="tw-text-muted-foreground" />
              </div>
              <div class="tw-flex-1 tw-text-left">
                <div class="tw-text-sm tw-font-medium tw-text-gray-900">
                  {{ currentAccessOption.label }}
                </div>
                <div class="tw-text-xs tw-text-muted-foreground">
                  {{ currentAccessOption.description }}
                </div>
              </div>
              <IconDown />
            </Button>
          </Popover>

          <!-- Default Permission for Anyone Access -->
          <div v-if="generalAccess === 'anyone'" class="tw-f-full">
            <Popover
              trigger="click"
              trigger-class="tw-h-full tw-w-full"
              placement="bottom"
              v-model:value="anyonePermissionPopoverOpen"
            >
              <template #content>
                <div class="tw-flex tw-flex-col tw-space-y-2 tw-p-2">
                  <Button
                    v-for="permission in userPermissions"
                    :key="permission.value"
                    @click="setAnyoneDefaultPermission(permission.value)"
                    class="tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
                  >
                    <component :is="permission.icon" class="tw-text-muted-foreground" />
                    <div class="tw-flex-1 tw-text-left">
                      <div class="tw-text-sm tw-font-medium tw-text-gray-900">{{ permission.label }}</div>
                      <div class="tw-text-xs tw-text-muted-foreground">{{ permission.description }}</div>
                    </div>
                    <IconCheckOne
                      v-if="anyoneDefaultPermission === permission.value"
                      class="tw-text-primary"
                    />
                  </Button>
                </div>
              </template>

              <Button
                class="tw-w-full tw-h-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-font-medium tw-text-gray-900 hover:tw-bg-gray-50 tw-transition-colors tw-flex tw-items-center tw-justify-between"
              >
                <component
                  :is="getPermissionIcon(anyoneDefaultPermission)"
                  class="tw-text-muted-foreground"
                />
                <span>{{ getSelectedPermissionLabel(anyoneDefaultPermission) }}</span>
                <IconDown class="tw-w-4 tw-h-4" />
              </Button>
            </Popover>
          </div>
        </div>
      </div>
    </div>

    <Button
      class="tw-px-4 tw-py-4 tw-flex tw-items-center tw-justify-center tw-m-4 tw-font-medium tw-text-lg"
      @click="copyLink"
      type="primary"
    >
      {{ t('header.shareMenu.copyLink') }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import message from '@/utils/message';
import { useI18n } from 'vue-i18n';
import { computed, ref, watch, onMounted } from 'vue';
import { api } from '@aiprimary/api';

const { t } = useI18n();

interface User {
  id: string;
  name: string;
  email: string;
  permission?: string;
}

interface PermissionOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface AccessOption {
  value: 'restricted' | 'anyone';
  label: string;
  description: string;
  icon: string;
}

const props = defineProps<{
  presentationId?: string;
}>();

const emit = defineEmits<{
  cancel: [];
  share: [options: { shareWithLink: boolean; allowEdit: boolean; users: User[] }];
}>();

// Configuration: User Permissions
const userPermissions = computed<PermissionOption[]>(() => [
  {
    value: 'Viewer',
    label: t('header.shareMenu.viewer'),
    description: t('header.shareMenu.viewerDescription'),
    icon: 'IconPreviewOpen',
  },
  {
    value: 'Commenter',
    label: t('header.shareMenu.commenter'),
    description: t('header.shareMenu.commenterDescription'),
    icon: 'IconComment',
  },
]);

// Configuration: General Access Options
const generalAccessOptions = computed<AccessOption[]>(() => [
  {
    value: 'restricted',
    label: t('header.shareMenu.restricted'),
    description: t('header.shareMenu.restrictedDescription'),
    icon: 'IconUser',
  },
  {
    value: 'anyone',
    label: t('header.shareMenu.anyoneWithLink'),
    description: t('header.shareMenu.anyoneWithLinkDescription'),
    icon: 'IconGlobe',
  },
]);

// State
const generalAccess = ref<'restricted' | 'anyone'>('restricted');
const anyoneDefaultPermission = ref('Viewer');
const searchQuery = ref('');
const selectedUsers = ref<User[]>([]);
const searchResults = ref<User[]>([]);
const permissionPopoverOpen = ref<{ [key: string]: boolean }>({});
const generalAccessPopoverOpen = ref(false);
const anyonePermissionPopoverOpen = ref(false);
const isLoadingSharedUsers = ref(false);
const isSearching = ref(false);

// Computed property to get the current access option
const currentAccessOption = computed(() => {
  return (
    generalAccessOptions.value.find((option) => option.value === generalAccess.value) ||
    generalAccessOptions.value[0]
  );
});

// Load existing shared users on mount
onMounted(() => {
  if (props.presentationId) {
    loadSharedUsers();
  }
});

const loadSharedUsers = async () => {
  if (!props.presentationId) return;

  isLoadingSharedUsers.value = true;
  try {
    const response = await api.get(`/api/resources/${props.presentationId}/shared-users`);
    const sharedUsers = response.data.data || [];
    selectedUsers.value = sharedUsers.map((user: any) => ({
      id: user.userId, // Backend returns 'userId', frontend expects 'id'
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      permission: user.permission === 'read' ? 'Viewer' : 'Commenter',
    }));
  } catch (error) {
    console.error('Failed to load shared users:', error);
    message.error(t('header.shareMenu.failedToLoadUsers') || 'Failed to load shared users');
  } finally {
    isLoadingSharedUsers.value = false;
  }
};

// Watch searchQuery and update search results with real API
let searchTimeout: NodeJS.Timeout | null = null;
watch(searchQuery, async () => {
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    try {
      const response = await api.get(`/api/user/search?q=${searchQuery.value}&limit=10`);
      const users = response.data.data || [];
      searchResults.value = users
        .filter((user: any) => !selectedUsers.value.some((selected) => selected.id === user.id))
        .map((user: any) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        }));
    } catch (error) {
      console.error('Search failed:', error);
      searchResults.value = [];
      message.error(t('header.shareMenu.searchFailed') || 'Failed to search users');
    } finally {
      isSearching.value = false;
    }
  }, 300);
});

// Watch for changes and emit share event automatically
watch(
  [generalAccess, anyoneDefaultPermission, selectedUsers],
  () => {
    emitShareEvent();
  },
  { deep: true }
);

const addUser = async (user: User) => {
  if (!props.presentationId) return;
  if (selectedUsers.value.some((u) => u.id === user.id)) return;

  const newUser: User = { ...user, permission: 'Viewer' };
  selectedUsers.value.push(newUser);
  searchQuery.value = '';
  searchResults.value = [];

  try {
    await api.post(`/api/resources/${props.presentationId}/share`, {
      targetUserIds: [user.id],
      permission: 'read',
    });
    message.success(t('header.shareMenu.userAdded') || `${user.name} can now view this presentation`);
  } catch (error) {
    console.error('Failed to share:', error);
    selectedUsers.value = selectedUsers.value.filter((u) => u.id !== user.id);
    message.error(t('header.shareMenu.failedToShare') || 'Failed to share presentation');
  }
};

const removeUser = async (userId: string) => {
  if (!props.presentationId) return;

  const user = selectedUsers.value.find((u) => u.id === userId);
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId);

  try {
    await api.post(`/api/resources/${props.presentationId}/revoke`, {
      targetUserId: userId,
    });
    message.success(t('header.shareMenu.accessRevoked') || `${user?.name} no longer has access`);
  } catch (error) {
    console.error('Failed to revoke access:', error);
    if (user) selectedUsers.value.push(user);
    message.error(t('header.shareMenu.failedToRevoke') || 'Failed to revoke access');
  }
};

const updateUserPermission = async (userId: string, newPermission: string | number) => {
  if (!props.presentationId) return;

  const user = selectedUsers.value.find((u) => u.id === userId);
  if (!user) return;

  const oldPermission = user.permission;
  user.permission = newPermission.toString();
  permissionPopoverOpen.value[userId] = false;

  try {
    await api.post(`/api/resources/${props.presentationId}/share`, {
      targetUserIds: [userId],
      permission: newPermission === 'Viewer' ? 'read' : 'comment',
    });
    message.success(t('header.shareMenu.permissionUpdated') || `User is now a ${newPermission}`);
  } catch (error) {
    console.error('Failed to update permission:', error);
    user.permission = oldPermission;
    message.error(t('header.shareMenu.failedToUpdate') || 'Failed to update permission');
  }
};

const setGeneralAccess = (value: 'restricted' | 'anyone') => {
  generalAccess.value = value;
  generalAccessPopoverOpen.value = false;
};

const setAnyoneDefaultPermission = (permission: string) => {
  anyoneDefaultPermission.value = permission;
  anyonePermissionPopoverOpen.value = false;
};

const getSelectedPermissionLabel = (permissionValue: string): string => {
  const permission = userPermissions.value.find((p) => p.value === permissionValue);
  return permission ? permission.label : 'Viewer';
};

const getPermissionIcon = (permissionValue: string): string => {
  const permission = userPermissions.value.find((p) => p.value === permissionValue);
  return permission ? permission.icon : 'IconPreviewOpen';
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const copyLink = () => {
  // In a real app, you'd copy the actual link
  navigator.clipboard.writeText(window.location.href + '?shared=true');
  message.success(t('header.shareMenu.linkCopied'));
};

const emitShareEvent = () => {
  // Determine if sharing with link based on general access setting
  const shareWithLink = generalAccess.value === 'anyone';

  // Determine if edit is allowed based on the permission settings
  // For now, we'll set allowEdit based on whether any user has edit permissions
  // or if the anyone permission allows editing (in this case, Commenter is the highest)
  const allowEdit =
    anyoneDefaultPermission.value === 'Commenter' ||
    selectedUsers.value.some((user) => user.permission === 'Commenter');

  emit('share', {
    shareWithLink,
    allowEdit,
    users: selectedUsers.value,
  });
};
</script>

<style scoped>
/* Custom scrollbar for search results */
.tw-overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.tw-overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tw-overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.tw-overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
