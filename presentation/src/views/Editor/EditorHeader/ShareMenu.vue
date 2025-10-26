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
      <div v-if="selectedUsers.length > 0" class="tw-mb-6">
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
import { computed, ref, watch } from 'vue';

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

// Computed property to get the current access option
const currentAccessOption = computed(() => {
  return (
    generalAccessOptions.value.find((option) => option.value === generalAccess.value) ||
    generalAccessOptions.value[0]
  );
});

// Mock user data
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com' },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie.wilson@example.com' },
];

// Watch searchQuery and update search results
watch(searchQuery, () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  searchResults.value = mockUsers.filter(
    (user) =>
      !selectedUsers.value.some((selected) => selected.id === user.id) &&
      (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
  );
});

// Watch for changes and emit share event automatically
watch(
  [generalAccess, anyoneDefaultPermission, selectedUsers],
  () => {
    emitShareEvent();
  },
  { deep: true }
);

const addUser = (user: User) => {
  if (!selectedUsers.value.some((u) => u.id === user.id)) {
    selectedUsers.value.push({ ...user, permission: 'Viewer' });
    searchQuery.value = '';
    searchResults.value = [];
  }
};

const removeUser = (userId: string) => {
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId);
};

const updateUserPermission = (userId: string, newPermission: string | number) => {
  const user = selectedUsers.value.find((u) => u.id === userId);
  if (user) {
    user.permission = newPermission.toString();
    permissionPopoverOpen.value[userId] = false;
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
