<template>
  <Popover class="relative flex" v-model:value="dropdownVisible" trigger="click" placement="bottom-end">
    <div
      class="flex cursor-pointer select-none items-center gap-1 rounded-md px-2 py-1.5 transition-colors duration-200"
      :title="$t('header.tools.changeLanguage')"
    >
      <span class="text-base leading-none">{{ getCurrentFlag() }}</span>
      <svg
        class="opacity-60 transition-all duration-200 hover:opacity-100"
        :class="{ 'rotate-180': dropdownVisible }"
        viewBox="0 0 16 16"
        width="12"
        height="12"
      >
        <path d="M8 10.5L4 6.5h8L8 10.5z" fill="currentColor" />
      </svg>
    </div>
    <template #content>
      <div class="min-w-[140px]">
        <div
          v-for="locale in getAvailableLocales()"
          :key="locale.code"
          @click="handleLocaleChange(locale.code)"
          :class="[
            'flex min-w-[80px] cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition-colors duration-200',
            locale.code === currentLocale
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
          ]"
        >
          <span class="flex-shrink-0 text-sm">{{ locale.flag }}</span>
          <span class="flex-1 text-xs">{{ locale.name }}</span>
          <svg
            v-if="locale.code === currentLocale"
            class="flex-shrink-0 opacity-80"
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
