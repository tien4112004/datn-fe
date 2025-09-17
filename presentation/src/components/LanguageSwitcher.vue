<template>
  <Popover class="tw-relative tw-flex" v-model:value="dropdownVisible" trigger="click" placement="bottom-end">
    <div
      class="tw-flex tw-cursor-pointer tw-select-none tw-items-center tw-gap-1 tw-rounded-md tw-px-2 tw-py-1.5 tw-transition-colors tw-duration-200"
      :title="$t('header.tools.changeLanguage')"
    >
      <span class="tw-text-base tw-leading-none">{{ getCurrentFlag() }}</span>
      <svg
        class="tw-opacity-60 tw-transition-all tw-duration-200 hover:tw-opacity-100"
        :class="{ 'tw-rotate-180': dropdownVisible }"
        viewBox="0 0 16 16"
        width="12"
        height="12"
      >
        <path d="M8 10.5L4 6.5h8L8 10.5z" fill="currentColor" />
      </svg>
    </div>
    <template #content>
      <div class="tw-min-w-[140px]">
        <div
          v-for="locale in getAvailableLocales()"
          :key="locale.code"
          @click="handleLocaleChange(locale.code)"
          :class="[
            'tw-flex tw-min-w-[80px] tw-cursor-pointer tw-items-center tw-gap-2 tw-rounded tw-px-3 tw-py-2 tw-text-sm tw-transition-colors tw-duration-200',
            locale.code === currentLocale
              ? 'tw-bg-primary tw-text-primary-foreground'
              : 'hover:tw-bg-accent hover:tw-text-accent-foreground',
          ]"
        >
          <span class="tw-flex-shrink-0 tw-text-sm">{{ locale.flag }}</span>
          <span class="tw-flex-1 tw-text-xs">{{ locale.name }}</span>
          <svg
            v-if="locale.code === currentLocale"
            class="tw-flex-shrink-0 tw-opacity-80"
            viewBox="0 0 16 16"
            width="12"
            height="12"
          >
            <path
              d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeLocale, getCurrentLocale, getAvailableLocales } from '@/locales';
import Popover from '@/components/Popover.vue';

const { locale } = useI18n();

const currentLocale = computed(() => getCurrentLocale());
const dropdownVisible = ref(false);

const getCurrentFlag = () => {
  const currentLoc = getAvailableLocales().find((l) => l.code === currentLocale.value);
  return currentLoc?.flag || '🌐';
};

const handleLocaleChange = (newLocale: string) => {
  if (changeLocale(newLocale)) {
    dropdownVisible.value = false;
  }
};
</script>
