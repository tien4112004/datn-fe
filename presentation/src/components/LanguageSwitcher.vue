<template>
  <Popover class="language-switcher" v-model:value="dropdownVisible" trigger="click" placement="bottom-end">
    <div class="language-icon" :title="$t('header.tools.changeLanguage')">
      <span class="current-flag">{{ getCurrentFlag() }}</span>
      <svg class="dropdown-arrow" viewBox="0 0 16 16" width="12" height="12">
        <path d="M8 10.5L4 6.5h8L8 10.5z" fill="currentColor" />
      </svg>
    </div>
    <template #content>
      <div class="language-menu">
        <PopoverMenuItem
          v-for="locale in getAvailableLocales()"
          :key="locale.code"
          @click="handleLocaleChange(locale.code)"
          :class="{ active: locale.code === currentLocale }"
        >
          <span class="flag">{{ locale.flag }}</span>
          <span class="locale-name">{{ locale.name }}</span>
          <svg
            v-if="locale.code === currentLocale"
            class="check-icon"
            viewBox="0 0 16 16"
            width="12"
            height="12"
          >
            <path
              d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
              fill="currentColor"
            />
          </svg>
        </PopoverMenuItem>
      </div>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeLocale, getCurrentLocale, getAvailableLocales } from '@/locales';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';

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

<style scoped lang="scss">
@use 'sass:color';

.language-switcher {
  position: relative;

  .language-icon {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    user-select: none;

    .current-flag {
      font-size: 16px;
      line-height: 1;
    }

    .dropdown-arrow {
      opacity: 0.6;
      transition: transform 0.2s ease;
    }

    &:hover .dropdown-arrow {
      opacity: 1;
    }
  }
}

.language-menu {
  min-width: 140px;

  :deep(.popover-menu-item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;

    &.active {
      background-color: color.adjust($primary, $lightness: +25%);
      color: $textColor;
    }

    .flag {
      font-size: 14px;
      flex-shrink: 0;
    }

    .locale-name {
      flex: 1;
      font-size: 13px;
    }

    .check-icon {
      opacity: 0.8;
      flex-shrink: 0;
    }
  }
}
</style>
