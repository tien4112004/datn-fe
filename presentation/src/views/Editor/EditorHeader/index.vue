<template>
  <div class="editor-header">
    <!-- Breadcrumb Section -->
    <div class="tw-flex tw-items-center tw-gap-2 tw-max-w-md tw-flex-shrink">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="tw-hidden md:tw-block tw-pl-4">
            <BreadcrumbLink @click="navigateToList" class="tw-cursor-pointer">
              {{ isStudent ? $t('header.breadcrumb.backToClass') : $t('header.breadcrumb.presentations') }}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="tw-hidden md:tw-block" />
          <BreadcrumbItem>
            <!-- Edit Mode -->
            <div v-if="editingTitle" class="tw-flex tw-items-center tw-gap-2">
              <Input
                ref="titleInputRef"
                v-model:value="titleValue"
                @blur="handleUpdateTitle"
                @keydown="handleKeyDown"
                class="tw-w-32 sm:tw-w-48 tw-h-7 tw-px-2 tw-text-sm tw-font-medium tw-border-primary"
              />
              <Button size="small" @click="handleUpdateTitle">
                <IconCheck class="tw-w-4 tw-h-4" />
              </Button>
              <Button size="small" @click="handleCancelEdit">
                <IconClose class="tw-w-4 tw-h-4" />
              </Button>
            </div>
            <!-- Display Mode -->
            <div v-else class="tw-flex tw-items-center tw-gap-2">
              <BreadcrumbPage class="tw-max-w-32 sm:tw-max-w-48 tw-truncate">{{ title }}</BreadcrumbPage>
              <Button
                v-if="permission === 'edit'"
                size="small"
                class="tw-p-1 tw-bg-transparent hover:tw-bg-gray-100"
                @click="startEditTitle"
              >
                <IconEdit class="tw-w-3 tw-h-3" />
              </Button>
            </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <!-- Permission Badge -->
    </div>

    <div class="tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0">
      <PermissionBadge v-if="permission" :permission="permission" class="tw-ml-2" />
      <Popover
        v-if="!hideStudentOptions"
        trigger="click"
        placement="bottom-end"
        v-model:value="mainMenuVisible"
      >
        <template #content>
          <PopoverMenuItem
            @click="
              slideCreationDialogVisible = true;
              mainMenuVisible = false;
            "
            >Create New Slide</PopoverMenuItem
          >
          <div class="menu-divider"></div>
          <FileInput
            accept="application/vnd.openxmlformats-officedocument.presentationml.presentation"
            @change="
              (files) => {
                importPPTXFile(files);
                mainMenuVisible = false;
              }
            "
          >
            <PopoverMenuItem>{{ $t('header.file.importPptx') }}</PopoverMenuItem>
          </FileInput>
          <FileInput
            accept=".pptist"
            @change="
              (files) => {
                importSpecificFile(files);
                mainMenuVisible = false;
              }
            "
          >
            <PopoverMenuItem>{{ $t('header.file.importPptist') }}</PopoverMenuItem>
          </FileInput>
          <PopoverMenuItem
            @click="
              openMarkupPanel();
              mainMenuVisible = false;
            "
            >{{ $t('header.tools.slideTypeAnnotation') }}</PopoverMenuItem
          >
          <PopoverMenuItem
            @click="
              mainMenuVisible = false;
              hotkeyDrawerVisible = true;
            "
            >{{ $t('header.tools.quickActions') }}</PopoverMenuItem
          >
        </template>
        <div class="menu-item">
          <IconHamburgerButton class="icon" />
        </div>
      </Popover>
      <Popover trigger="click" center contentClass="!tw-p-0 tw-min-w-[340px]">
        <template #content>
          <PresenterMenu @select="handlePresentationMode" />
        </template>
        <Button class="menu-item" v-tooltip="$t('header.presentation.slideShow')">
          <IconPpt />
          <span class="tw-hidden sm:tw-inline">{{ $t('header.buttons.present') }}</span>
        </Button>
      </Popover>

      <Popover v-if="permission === 'edit'" trigger="click" center contentClass="!tw-p-0">
        <template #content>
          <ShareMenu :presentationId="presentationId" @cancel="handleShareCancel" @share="handleShare" />
        </template>
        <Button class="menu-item" v-tooltip="$t('header.share.sharePresentation')">
          <IconShare class="icon" />
          <span class="tw-hidden sm:tw-inline">{{ $t('header.buttons.share') }}</span>
        </Button>
      </Popover>
      <Button
        v-if="permission === 'comment' || permission === 'edit'"
        class="menu-item"
        v-tooltip="$t('header.comments.tooltip')"
        @click="handleOpenComments"
      >
        <IconComments class="icon" />
        <span class="tw-hidden sm:tw-inline">{{ $t('header.buttons.comments') }}</span>
      </Button>
      <Button
        v-if="!hideStudentOptions"
        class="menu-item"
        v-tooltip="$t('header.file.duplicatePresentation')"
        @click="handleRequestDuplicate"
      >
        <IconCopy class="icon" />
        <span class="tw-hidden sm:tw-inline">{{ $t('header.buttons.duplicate') }}</span>
      </Button>
      <Button
        v-if="!hideStudentOptions"
        class="menu-item"
        v-tooltip="$t('header.file.exportFile')"
        @click="setDialogForExport('pptx')"
      >
        <IconDownload class="icon" />
        <span class="tw-hidden sm:tw-inline">{{ $t('header.share.export') }}</span>
      </Button>
      <div class="menu-item" id="language-switcher">
        <LanguageSwitcher />
      </div>
    </div>

    <Drawer :width="320" v-model:visible="hotkeyDrawerVisible" placement="right">
      <HotkeyDoc />
      <template v-slot:title>{{ $t('header.tools.quickActions') }}</template>
    </Drawer>

    <SlideCreationDialog
      :visible="slideCreationDialogVisible"
      :themes="availableThemes"
      @close="slideCreationDialogVisible = false"
      @create="handleCreateSlide"
    />

    <FullscreenSpin :loading="exporting" :tip="$t('header.file.importing')" />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMainStore, useSlidesStore, useContainerStore } from '@/store';
import useScreening from '@/hooks/useScreening';
import useImport from '@/hooks/useImport';
import useSlideHandler from '@/hooks/useSlideHandler';
import useSlideTemplates from '@/hooks/useSlideTemplates';
import { useUpdatePresentation } from '@/services/presentation/queries';
import type { DialogForExportTypes } from '@/types/export';

import HotkeyDoc from './HotkeyDoc.vue';
import SlideCreationDialog from './SlideCreationDialog.vue';
import PresenterMenu from './PresenterMenu.vue';
import ShareMenu from './ShareMenu.vue';
import FileInput from '@/components/FileInput.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import Drawer from '@/components/Drawer.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
import Button from '@/components/Button.vue';
import Breadcrumb from '@/components/ui/breadcrumb/Breadcrumb.vue';
import BreadcrumbList from '@/components/ui/breadcrumb/BreadcrumbList.vue';
import BreadcrumbItem from '@/components/ui/breadcrumb/BreadcrumbItem.vue';
import BreadcrumbLink from '@/components/ui/breadcrumb/BreadcrumbLink.vue';
import BreadcrumbPage from '@/components/ui/breadcrumb/BreadcrumbPage.vue';
import BreadcrumbSeparator from '@/components/ui/breadcrumb/BreadcrumbSeparator.vue';
import {
  Check as IconCheck,
  X as IconClose,
  MessageSquare as IconComments,
  Copy as IconCopy,
} from 'lucide-vue-next';
import message from '@/utils/message';
import PermissionBadge from '@/components/PermissionBadge.vue';
const { t } = useI18n();
const route = useRoute();
const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const containerStore = useContainerStore();
const { title, theme } = storeToRefs(slidesStore);
const { presentation, permission, mode, isStudent } = storeToRefs(containerStore);

// Computed for hiding student-restricted items
const hideStudentOptions = computed(() => isStudent?.value && mode.value === 'view');
const { enterScreening, enterScreeningFromStart, enterPresenterMode, openSeparatedPresentation } =
  useScreening();
const { importSpecificFile, importPPTXFile, exporting } = useImport();
const { resetSlides } = useSlideHandler();
const { createSlide, getThemes } = useSlideTemplates();

// Get presentation ID from container store
const presentationId = computed(() => presentation?.value?.id || (route.params.id as string) || '');

const updatePresentationMutation = useUpdatePresentation();

const mainMenuVisible = ref(false);
const hotkeyDrawerVisible = ref(false);
const slideCreationDialogVisible = ref(false);
const editingTitle = ref(false);
const titleInputRef = ref<InstanceType<typeof Input>>();
const titleValue = ref('');

const availableThemes = getThemes();

// const handleToggleSidebar = () => {
//   document.dispatchEvent(new CustomEvent('toggleSidebar', {}));
// };

const startEditTitle = () => {
  titleValue.value = title.value;
  editingTitle.value = true;
  nextTick(() => titleInputRef.value?.focus());
};

const handleUpdateTitle = async () => {
  const trimmedTitle = titleValue.value.trim();

  if (!trimmedTitle) {
    titleValue.value = title.value;
    editingTitle.value = false;
    return;
  }

  if (trimmedTitle === title.value) {
    editingTitle.value = false;
    return;
  }

  if (!presentationId.value) {
    console.error('No presentation ID available');
    message.error(t('header.title.updateError'));
    return;
  }

  // Update in store first (optimistic update)
  const previousTitle = title.value;
  slidesStore.setTitle(trimmedTitle);
  editingTitle.value = false;

  // Call API to persist the change using mutation
  updatePresentationMutation.mutate(
    {
      presentationId: presentationId.value,
      data: { title: trimmedTitle },
    },
    {
      onSuccess: () => {
        message.success(t('header.title.updateSuccess'));
      },
      onError: (error) => {
        console.error('Failed to update title:', error);
        message.error(t('header.title.updateError'));
        // Revert the title on error
        titleValue.value = previousTitle;
        slidesStore.setTitle(previousTitle);
      },
    }
  );
};

const handleCancelEdit = () => {
  titleValue.value = title.value;
  editingTitle.value = false;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleUpdateTitle();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    handleCancelEdit();
  }
};

const navigateToList = () => {
  // Dispatch event to React for proper navigation (respects unsaved changes blocker)
  if (isStudent?.value) {
    window.dispatchEvent(
      new CustomEvent('app.presentation.navigate', {
        detail: { path: '/student/classes' },
      })
    );
  } else {
    window.dispatchEvent(
      new CustomEvent('app.presentation.navigate', {
        detail: { path: '/projects?type=presentation' },
      })
    );
  }
};

const setDialogForExport = (type: DialogForExportTypes) => {
  mainStore.setDialogForExport(type);
  mainMenuVisible.value = false;
};

const openMarkupPanel = () => {
  mainStore.setMarkupPanelState(true);
};

const handleCreateSlide = async (slideType: string, themeName: string) => {
  await createSlide(slideType, themeName);
};

const enterPresenterView = () => {
  enterPresenterMode();
};

const handlePresentationMode = (
  mode: 'fromBeginning' | 'fromCurrent' | 'presenterView' | 'separatedWindow'
) => {
  switch (mode) {
    case 'fromBeginning':
      enterScreeningFromStart();
      break;
    case 'fromCurrent':
      enterScreening();
      break;
    case 'presenterView':
      enterPresenterView();
      break;
    case 'separatedWindow':
      openSeparatedPresentation();
      break;
  }
};

const handleShareCancel = () => {
  message.info(t('header.share.shareCanceled'));
};

const handleShare = (options: { shareWithLink: boolean; allowEdit: boolean; users: any[] }) => {
  // ShareMenu component now handles all its own success messages
  // This handler kept for potential future logic (logging, analytics, etc.)
  console.debug('Share settings updated:', options);
};

const handleOpenComments = () => {
  window.dispatchEvent(new CustomEvent('app.presentation.open-comments'));
};

const handleRequestDuplicate = () => {
  if (!presentationId.value) {
    console.error('No presentation ID available');
    message.error(t('header.file.duplicateError'));
    return;
  }

  // Dispatch event to React app to show confirmation dialog
  window.dispatchEvent(
    new CustomEvent('app.presentation.confirm-duplicate', {
      detail: { presentationId: presentationId.value },
    })
  );
};
</script>

<style lang="scss" scoped>
.editor-header {
  user-select: none;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.menu-item {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  padding: 0 10px;
  border-radius: var(--presentation-radius);
  cursor: pointer;

  .icon {
    color: #666666;
  }
  .text {
    width: 18px;
    text-align: center;
    font-size: 17px;
  }
  .ai {
    background: linear-gradient(270deg, #d897fd, #33bcfc);
    background-clip: text;
    color: transparent;
    font-weight: 700;
  }

  &:hover {
    background-color: #f1f1f1;
  }
}
.group-menu-item {
  height: 30px;
  display: flex;
  margin: 0 8px;
  padding: 0 2px;
  border-radius: var(--presentation-radius);

  &:hover {
    background-color: #f1f1f1;
  }

  .menu-item {
    padding: 0 3px;
  }
  .arrow-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
.title {
  height: 30px;
  margin-left: 2px;
  font-size: 0.875rem;

  .title-input {
    width: 200px;
    height: 100%;
    padding-left: 0;
    padding-right: 0;

    ::v-deep(input) {
      height: 28px;
      line-height: 28px;
    }
  }
  .title-text {
    min-width: 20px;
    max-width: 400px;
    line-height: 30px;
    padding: 0 6px;
    border-radius: var(--presentation-radius);
    cursor: pointer;
    @include ellipsis-oneline();

    &:hover {
      background-color: var(--presentation-sidebar);
    }
  }
}
.github-link {
  display: inline-block;
  height: 30px;
}
</style>
