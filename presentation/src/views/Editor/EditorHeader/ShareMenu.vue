<template>
  <div class="tw-bg-white tw-rounded-lg tw-shadow-xl tw-w-[540px] tw-max-h-[400px] tw-flex tw-flex-col">
    <!-- Header -->
    <div class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
      <h2 class="tw-text-xl tw-font-normal tw-text-gray-900 tw-m-0">Share "Presentation"</h2>
      <button
        @click="$emit('close')"
        class="tw-text-gray-400 hover:tw-text-muted-foreground tw-transition-colors"
      >
        <IconClose class="!tw-w-5 !tw-h-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="tw-flex-1 tw-overflow-y-auto tw-px-6 tw-py-4">
      <!-- Add People Section -->
      <div class="tw-mb-6">
        <div class="tw-relative">
          <Input
            v-model:value="searchQuery"
            placeholder="Add people, groups, or calendar events"
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
        <h3 class="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">People with access</h3>
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
            <Popover trigger="click" placement="bottom" v-model:value="rolePopoverOpen[user.id]">
              <template #content>
                <div class="tw-flex tw-flex-col tw-space-y-1 tw-p-2">
                  <Button
                    @click="updateUserRole(user.id, 'Viewer')"
                    class="tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
                  >
                    <IconPreviewOpen class="tw-text-muted-foreground" />
                    <div class="tw-flex-1 tw-text-left">
                      <div class="tw-text-sm tw-font-medium tw-text-gray-900">Viewer</div>
                      <div class="tw-text-xs tw-text-muted-foreground">Can view only</div>
                    </div>
                    <IconCheckOne v-if="user.role === 'Viewer'" class="tw-text-primary" />
                  </Button>
                  <Button
                    @click="updateUserRole(user.id, 'Commenter')"
                    class="tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
                  >
                    <IconComment class="tw-text-muted-foreground" />
                    <div class="tw-flex-1 tw-text-left">
                      <div class="tw-text-sm tw-font-medium tw-text-gray-900">Commenter</div>
                      <div class="tw-text-xs tw-text-muted-foreground">Can view and comment</div>
                    </div>
                    <IconCheckOne v-if="user.role === 'Commenter'" class="tw-text-primary" />
                  </Button>
                </div>
              </template>

              <Button
                class="tw-px-3 tw-py-1.5 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-font-medium tw-text-gray-900 hover:tw-bg-gray-50 tw-transition-colors tw-flex tw-items-center tw-gap-1"
              >
                <IconPreviewOpen class="tw-text-muted-foreground" v-if="user?.role === 'Viewer'" />
                <IconComment class="tw-text-muted-foreground" v-else-if="user?.role === 'Commenter'" />
                {{ user.role || 'Viewer' }}
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
        <h3 class="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">General access</h3>

        <div class="tw-flex tw-gap-4 tw-items-stretch">
          <Popover
            trigger="click"
            trigger-class="tw-flex-1"
            placement="bottom"
            v-model:value="generalAccessPopoverOpen"
          >
            <template #content>
              <Button
                @click="setGeneralAccess('restricted')"
                class="tw-w-full tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
              >
                <IconUser class="tw-text-muted-foreground" />
                <div class="tw-flex-1 tw-text-left">
                  <div class="tw-text-sm tw-font-medium tw-text-gray-900">Restricted</div>
                  <div class="tw-text-xs tw-text-muted-foreground">Only people with access can open</div>
                </div>
                <IconCheckOne v-if="generalAccess === 'restricted'" class="tw-text-primary" />
              </Button>
              <Button
                @click="setGeneralAccess('anyone')"
                class="tw-w-full tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
              >
                <IconGlobe class="tw-text-muted-foreground" />
                <div class="tw-flex-1 tw-text-left">
                  <div class="tw-text-sm tw-font-medium tw-text-gray-900">Anyone with the link</div>
                  <div class="tw-text-xs tw-text-muted-foreground">Anyone on the internet can view</div>
                </div>
                <IconCheckOne v-if="generalAccess === 'anyone'" class="tw-text-primary" />
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

          <!-- Default Role for Anyone Access -->
          <div v-if="generalAccess === 'anyone'" class="tw-f-full">
            <Popover
              trigger="click"
              trigger-class="tw-h-full tw-w-full"
              placement="bottom"
              v-model:value="anyoneRolePopoverOpen"
            >
              <template #content>
                <div class="tw-flex tw-flex-col tw-space-y-1 tw-p-2">
                  <Button
                    @click="setAnyoneDefaultRole('Viewer')"
                    class="tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
                  >
                    <IconPreviewOpen class="tw-text-muted-foreground" />
                    <div class="tw-flex-1 tw-text-left">
                      <div class="tw-text-sm tw-font-medium tw-text-gray-900">Viewer</div>
                      <div class="tw-text-xs tw-text-muted-foreground">Can view only</div>
                    </div>
                    <IconCheckOne v-if="anyoneDefaultRole === 'Viewer'" class="tw-text-primary" />
                  </Button>
                  <Button
                    @click="setAnyoneDefaultRole('Commenter')"
                    class="tw-h-fit tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
                  >
                    <IconComment class="tw-text-muted-foreground" />
                    <div class="tw-flex-1 tw-text-left">
                      <div class="tw-text-sm tw-font-medium tw-text-gray-900">Commenter</div>
                      <div class="tw-text-xs tw-text-muted-foreground">Can view and comment</div>
                    </div>
                    <IconCheckOne v-if="anyoneDefaultRole === 'Commenter'" class="tw-text-primary" />
                  </Button>
                </div>
              </template>

              <Button
                class="tw-w-full tw-h-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-font-medium tw-text-gray-900 hover:tw-bg-gray-50 tw-transition-colors tw-flex tw-items-center tw-justify-between"
              >
                <IconPreviewOpen class="tw-text-muted-foreground" v-if="anyoneDefaultRole === 'Viewer'" />
                <IconComment class="tw-text-muted-foreground" v-else-if="anyoneDefaultRole === 'Commenter'" />
                <span>{{ getSelectedRoleLabel(anyoneDefaultRole) }}</span>
                <IconDown class="tw-w-4 tw-h-4" />
              </Button>
            </Popover>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4 tw-border-t tw-border-gray-200">
      <Button
        @click="copyLink"
        class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-primary hover:tw-bg-blue-50 tw-rounded tw-transition-colors"
      >
        Copy link
      </Button>
      <Button
        @click="$emit('done')"
        class="tw-px-6 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 tw-rounded tw-transition-colors"
      >
        Done
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/Button.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import message from '@/utils/message';
import { computed, ref, watch } from 'vue';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface RoleOption {
  value: string;
  label: string;
  description: string;
}

interface AccessOption {
  value: 'restricted' | 'anyone';
  label: string;
  description: string;
  icon: string;
}

defineEmits<{
  close: [];
  done: [];
}>();

// Configuration: User Roles
const userRoles: RoleOption[] = [
  {
    value: 'Viewer',
    label: 'Viewer',
    description: 'Can view only',
  },
  {
    value: 'Commenter',
    label: 'Commenter',
    description: 'Can view and comment',
  },
];

// Configuration: Allowed roles for "anyone" access (restricted to Viewer and Commenter)
const allowedAnyoneRoles: RoleOption[] = [
  {
    value: 'Viewer',
    label: 'Viewer',
    description: 'Can view only',
  },
  {
    value: 'Commenter',
    label: 'Commenter',
    description: 'Can view and comment',
  },
];

// Configuration: General Access Options
const generalAccessOptions: AccessOption[] = [
  {
    value: 'restricted',
    label: 'Restricted',
    description: 'Only people with access can open',
    icon: 'IconUser',
  },
  {
    value: 'anyone',
    label: 'Anyone with the link',
    description: 'Anyone on the internet can view',
    icon: 'IconGlobe',
  },
];

// State
const generalAccess = ref<'restricted' | 'anyone'>('restricted');
const anyoneDefaultRole = ref('Viewer');
const searchQuery = ref('');
const selectedUsers = ref<User[]>([]);
const searchResults = ref<User[]>([]);
const rolePopoverOpen = ref<{ [key: string]: boolean }>({});
const generalAccessPopoverOpen = ref(false);
const anyoneRolePopoverOpen = ref(false);

// Computed property to get the current access option
const currentAccessOption = computed(() => {
  return (
    generalAccessOptions.find((option) => option.value === generalAccess.value) || generalAccessOptions[0]
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

const addUser = (user: User) => {
  if (!selectedUsers.value.some((u) => u.id === user.id)) {
    selectedUsers.value.push({ ...user, role: 'Viewer' });
    searchQuery.value = '';
    searchResults.value = [];
  }
};

const removeUser = (userId: string) => {
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== userId);
};

const updateUserRole = (userId: string, newRole: string | number) => {
  const user = selectedUsers.value.find((u) => u.id === userId);
  if (user) {
    user.role = newRole.toString();
    rolePopoverOpen.value[userId] = false;
  }
};

const setGeneralAccess = (value: 'restricted' | 'anyone') => {
  generalAccess.value = value;
  generalAccessPopoverOpen.value = false;
};

const setAnyoneDefaultRole = (role: string) => {
  anyoneDefaultRole.value = role;
  anyoneRolePopoverOpen.value = false;
};

const getSelectedRoleLabel = (roleValue: string): string => {
  const role = allowedAnyoneRoles.find((r) => r.value === roleValue);
  return role ? role.label : 'Viewer';
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
  navigator.clipboard.writeText('tondeptrai');
  message.success('Link copied to clipboard!');
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
