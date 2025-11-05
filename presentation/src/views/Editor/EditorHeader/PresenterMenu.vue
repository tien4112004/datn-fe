<template>
  <div class="tw-bg-white tw-rounded-lg tw-overflow-hidden">
    <div class="tw-px-4 tw-py-3 tw-bg-gray-50 tw-border-b tw-border-gray-200">
      <h3 class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-m-0">
        {{ $t('header.presentation.slideShow') }}
      </h3>
    </div>

    <!-- From Beginning Option -->
    <div
      @click="$emit('select', 'fromBeginning')"
      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-cursor-pointer tw-transition-colors hover:tw-bg-gray-50"
    >
      <div
        class="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200"
      >
        <IconPresentFromStart class="tw-text-blue-600" />
      </div>
      <div class="tw-flex-1 tw-min-w-0">
        <h4 class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-m-0 tw-mb-1">
          {{ $t('header.presentation.fromBeginning') }}
        </h4>
        <p class="tw-text-xs tw-text-gray-600 tw-m-0 tw-leading-tight">
          Start presenting from the first slide
        </p>
      </div>
    </div>

    <div class="tw-h-px tw-bg-gray-200 tw-mx-4"></div>

    <!-- From Current Page Option -->
    <div
      @click="$emit('select', 'fromCurrent')"
      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-cursor-pointer tw-transition-colors hover:tw-bg-gray-50"
    >
      <div
        class="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-green-50 tw-rounded-lg tw-border tw-border-green-200"
      >
        <IconPresentFromCurrent class="tw-text-green-600" />
      </div>
      <div class="tw-flex-1 tw-min-w-0">
        <h4 class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-m-0 tw-mb-1">
          {{ $t('header.presentation.fromCurrentPage') }}
        </h4>
        <p class="tw-text-xs tw-text-gray-600 tw-m-0 tw-leading-tight">
          Start from the currently selected slide
        </p>
      </div>
    </div>

    <div class="tw-h-px tw-bg-gray-200 tw-mx-4"></div>

    <!-- Presenter View Option -->
    <div
      @click="$emit('select', 'presenterView')"
      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-cursor-pointer tw-transition-colors hover:tw-bg-gray-50"
    >
      <div
        class="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-200"
      >
        <IconPresenterView class="tw-text-purple-600" />
      </div>
      <div class="tw-flex-1 tw-min-w-0">
        <h4 class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-m-0 tw-mb-1">
          {{ $t('header.presentation.presenterView') }}
        </h4>
        <p class="tw-text-xs tw-text-gray-600 tw-m-0 tw-leading-tight">
          {{ $t('header.presentation.presenterViewDescription') }}
        </p>
      </div>
    </div>

    <div class="tw-h-px tw-bg-gray-200 tw-mx-4"></div>

    <!-- Separated Window Option -->
    <div
      @click="$emit('select', 'separatedWindow')"
      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-cursor-pointer tw-transition-colors hover:tw-bg-gray-50"
    >
      <div
        class="tw-flex-shrink-0 tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-orange-50 tw-rounded-lg tw-border tw-border-orange-200"
      >
        <IconPresentSeparated class="tw-text-orange-600" />
      </div>
      <div class="tw-flex-1 tw-min-w-0">
        <h4 class="tw-text-sm tw-font-semibold tw-text-gray-800 tw-m-0 tw-mb-1">
          {{ $t('header.presentation.separatedWindow') }}
        </h4>
        <p class="tw-text-xs tw-text-gray-600 tw-m-0 tw-leading-tight">
          {{ $t('header.presentation.separatedWindowDescription') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  select: [mode: 'fromBeginning' | 'fromCurrent' | 'presenterView' | 'separatedWindow'];
}>();
</script>
