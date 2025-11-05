<template>
  <div class="editor-header">
    <div class="tw-flex tw-items-center">
      <Button
        class="tw-border-0 tw-bg-transparent hover:tw-bg-gray-100"
        @click="goBack"
        v-if="showBackButton"
      >
        <IconLeft class="!tw-w-4 !tw-h-4" />
      </Button>

      <div class="title">
        <Input
          class="title-input"
          ref="titleInputRef"
          v-model:value="titleValue"
          @blur="handleUpdateTitle()"
          v-if="editingTitle"
        />
        <div
          class="title-text tw-flex tw-items-center tw-gap-2"
          @click="startEditTitle()"
          :title="title"
          v-else
        >
          <IconEdit />
          {{ title }}
        </div>
      </div>
    </div>

    <div class="tw-flex tw-items-center tw-gap-2">
      <Popover trigger="click" placement="bottom-end" v-model:value="mainMenuVisible">
        <template #content>
          <PopoverMenuItem
            @click="
              openAIPPTDialog();
              mainMenuVisible = false;
            "
            >{{ $t('header.ai.aiGeneratePPT') }}</PopoverMenuItem
          >
          <div class="menu-divider"></div>
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
          <PopoverMenuItem @click="setDialogForExport('pptx')">{{
            $t('header.file.exportFile')
          }}</PopoverMenuItem>
          <PopoverMenuItem
            @click="
              resetSlides();
              mainMenuVisible = false;
            "
            >{{ $t('header.file.resetSlides') }}</PopoverMenuItem
          >
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
          <div class="handler-item">
            <IconHamburgerButton class="icon" />
          </div>
        </div>
      </Popover>
      <Popover trigger="click" center contentClass="!tw-p-0 tw-min-w-[340px]">
        <template #content>
          <PresenterMenu @select="handlePresentationMode" />
        </template>
        <Button class="menu-item" v-tooltip="$t('header.presentation.slideShow')">
          <IconPpt />
          {{ $t('header.buttons.present') }}
        </Button>
      </Popover>

      <Popover trigger="click" center contentClass="!tw-p-0">
        <template #content>
          <ShareMenu @cancel="handleShareCancel" @share="handleShare" />
        </template>
        <Button class="menu-item" v-tooltip="$t('header.share.sharePresentation')">
          <IconShare class="icon" />
          {{ $t('header.buttons.share') }}
        </Button>
      </Popover>
      <!-- <div
        class="menu-item"
        v-tooltip="$t('header.ai.aiGeneratePPT')"
        @click="
          openAIPPTDialog();
          mainMenuVisible = false;
        "
      >
        <span class="text ai">AI</span>
      </div> -->
      <Button
        class="handler-item"
        v-tooltip="$t('header.file.exportFile')"
        @click="setDialogForExport('pptx')"
      >
        <IconDownload class="icon" />
        {{ $t('header.share.export') }}
      </Button>
      <!-- <a
        class="github-link"
        v-tooltip="$t('header.meta.copyright')"
        href="https://github.com/pipipi-pikachu/PPTist"
        target="_blank"
      >
        <div class="menu-item">
          <div class="handler-item">
            <IconGithub class="icon" />
          </div>
        </div>
      </a> -->
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
import { useMainStore, useSlidesStore } from '@/store';
import useScreening from '@/hooks/useScreening';
import useImport from '@/hooks/useImport';
import useSlideHandler from '@/hooks/useSlideHandler';
import useSlideTemplates from '@/hooks/useSlideTemplates';
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
import message from '@/utils/message';
const { t } = useI18n();
const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const { title, theme } = storeToRefs(slidesStore);
const { enterScreening, enterScreeningFromStart, enterPresenterMode, openSeparatedPresentation } =
  useScreening();
const { importSpecificFile, importPPTXFile, exporting } = useImport();
const { resetSlides } = useSlideHandler();
const { createSlide, getThemes } = useSlideTemplates();

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

const handleUpdateTitle = () => {
  slidesStore.setTitle(titleValue.value);
  editingTitle.value = false;
};

const goLink = (url: string) => {
  window.open(url);
  mainMenuVisible.value = false;
};

const setDialogForExport = (type: DialogForExportTypes) => {
  mainStore.setDialogForExport(type);
  mainMenuVisible.value = false;
};

const openMarkupPanel = () => {
  mainStore.setMarkupPanelState(true);
};

const openAIPPTDialog = () => {
  mainStore.setAIPPTDialogState(true);
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

const goBack = () => {
  window.history.back();
};

const showBackButton = computed(() => {
  return (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/' &&
    window.history.length > 1 &&
    document.referrer !== '' &&
    new URL(document.referrer).origin === window.location.origin
  );
});

const handleShareCancel = () => {
  message.info(t('header.share.shareCanceled'));
};

const handleShare = (options: { shareWithLink: boolean; allowEdit: boolean; users: any[] }) => {
  const { shareWithLink, allowEdit, users } = options;

  let shareMessage = t('header.share.shareSettingsUpdated');

  if (shareWithLink) {
    shareMessage +=
      t('header.share.anyoneWithLinkCan') + (allowEdit ? t('header.share.comment') : t('header.share.view'));
  } else {
    shareMessage += t('header.share.restrictedAccess');
  }

  if (users.length > 0) {
    shareMessage += ' | ' + users.length + t('header.share.usersAdded');
  }

  message.success(shareMessage);
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
