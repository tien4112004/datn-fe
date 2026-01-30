<!--
  Example Component: Demonstrates TanStack Query usage
  
  This is a reference implementation showing:
  - Basic query usage
  - Mutations with loading states
  - Error handling
  - Optimistic updates
  - Reactive parameters
-->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePresentation, useUpdatePresentation, useSlideThemes, useSearchUsers } from '@/services/queries';

// ============================================================================
// Example 1: Basic Query
// ============================================================================

const presentationId = ref('presentation-123');

// Fetch presentation - automatically refetches when presentationId changes
const {
  data: presentation,
  isLoading: isPresentationLoading,
  error: presentationError,
  refetch: refetchPresentation,
} = usePresentation(presentationId);

// ============================================================================
// Example 2: Mutation with Loading State
// ============================================================================

const updateMutation = useUpdatePresentation();
const newTitle = ref('');

const updateTitle = () => {
  updateMutation.mutate(
    {
      presentationId: presentationId.value,
      data: { title: newTitle.value },
    },
    {
      onSuccess: () => {
        console.log('✅ Title updated successfully');
        newTitle.value = ''; // Clear input
      },
      onError: (error) => {
        console.error('❌ Failed to update:', error);
      },
    }
  );
};

// ============================================================================
// Example 3: Paginated Query
// ============================================================================

const currentPage = ref(1);
const { data: themesData, isLoading: isThemesLoading } = useSlideThemes(
  computed(() => ({ page: currentPage.value, limit: 10 }))
);

const themes = computed(() => themesData.value?.data ?? []);
const hasNextPage = computed(() => themesData.value?.hasMore ?? false);
const hasPreviousPage = computed(() => currentPage.value > 1);

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (hasPreviousPage.value) {
    currentPage.value--;
  }
};

// ============================================================================
// Example 4: Search with Conditional Fetching
// ============================================================================

const searchQuery = ref('');
const {
  data: searchResults,
  isLoading: isSearching,
  error: searchError,
} = useSearchUsers(searchQuery, {
  // Only search if query is at least 3 characters
  enabled: computed(() => searchQuery.value.length >= 3),
});

// ============================================================================
// Helper Methods
// ============================================================================

const formatError = (error: any) => {
  return error?.message || 'An unknown error occurred';
};
</script>

<template>
  <div class="example-component space-y-8 p-6">
    <!-- Example 1: Basic Query -->
    <section class="rounded-lg border p-4">
      <h2 class="mb-4 text-xl font-bold">Example 1: Basic Query</h2>

      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            v-model="presentationId"
            placeholder="Enter presentation ID"
            class="rounded border px-3 py-2"
          />
          <button
            @click="() => refetchPresentation()"
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Refetch
          </button>
        </div>

        <div v-if="isPresentationLoading" class="text-gray-600">Loading presentation...</div>

        <div v-else-if="presentationError" class="text-red-600">
          Error: {{ formatError(presentationError) }}
        </div>

        <div v-else-if="presentation" class="rounded bg-gray-50 p-4">
          <h3 class="font-semibold">{{ presentation.title }}</h3>
          <p class="text-sm text-gray-600">ID: {{ presentation.id }}</p>
        </div>
      </div>
    </section>

    <!-- Example 2: Mutation -->
    <section class="rounded-lg border p-4">
      <h2 class="mb-4 text-xl font-bold">Example 2: Mutation with Loading State</h2>

      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            v-model="newTitle"
            placeholder="New title"
            class="flex-1 rounded border px-3 py-2"
            @keyup.enter="updateTitle"
          />
          <button
            @click="updateTitle"
            :disabled="updateMutation.isPending.value || !newTitle"
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ updateMutation.isPending.value ? 'Updating...' : 'Update Title' }}
          </button>
        </div>

        <div v-if="updateMutation.isError.value" class="text-sm text-red-600">
          Error: {{ formatError(updateMutation.error.value) }}
        </div>

        <div v-if="updateMutation.isSuccess.value" class="text-sm text-green-600">
          ✅ Title updated successfully!
        </div>
      </div>
    </section>

    <!-- Example 3: Pagination -->
    <section class="rounded-lg border p-4">
      <h2 class="mb-4 text-xl font-bold">Example 3: Paginated Query</h2>

      <div class="space-y-4">
        <div v-if="isThemesLoading" class="text-gray-600">Loading themes...</div>

        <div v-else class="space-y-2">
          <div v-for="theme in themes" :key="theme.id" class="rounded bg-gray-50 p-3 hover:bg-gray-100">
            <div class="font-medium">{{ theme.name }}</div>
          </div>

          <div v-if="themes.length === 0" class="py-4 text-center text-gray-500">No themes found</div>
        </div>

        <div class="flex items-center justify-between">
          <button
            @click="previousPage"
            :disabled="!hasPreviousPage || isThemesLoading"
            class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span class="text-sm text-gray-600">Page {{ currentPage }}</span>

          <button
            @click="nextPage"
            :disabled="!hasNextPage || isThemesLoading"
            class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <!-- Example 4: Search -->
    <section class="rounded-lg border p-4">
      <h2 class="mb-4 text-xl font-bold">Example 4: Search with Conditional Fetching</h2>

      <div class="space-y-2">
        <input
          v-model="searchQuery"
          placeholder="Search users (min 3 characters)"
          class="w-full rounded border px-3 py-2"
        />

        <div v-if="searchQuery.length > 0 && searchQuery.length < 3" class="text-sm text-gray-500">
          Type at least 3 characters to search
        </div>

        <div v-if="isSearching" class="text-gray-600">Searching...</div>

        <div v-else-if="searchError" class="text-red-600">Error: {{ formatError(searchError) }}</div>

        <div v-else-if="searchResults && searchResults.length > 0" class="space-y-2">
          <div v-for="user in searchResults" :key="user.id" class="rounded bg-gray-50 p-3 hover:bg-gray-100">
            <div class="font-medium">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="text-sm text-gray-600">{{ user.email }}</div>
          </div>
        </div>

        <div
          v-else-if="searchQuery.length >= 3 && searchResults?.length === 0"
          class="py-4 text-center text-gray-500"
        >
          No users found
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Component-specific styles */
.example-component {
  max-width: 800px;
  margin: 0 auto;
}
</style>
