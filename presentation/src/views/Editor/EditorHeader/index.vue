<template>
  <div class="editor-header">
    <div class="left">
      <button class="menu-item" @click="handleToggleSidebar">
        <IconMoreApp />
      </button>
      

      <div class="title">
        <Input
          class="title-input"
          ref="titleInputRef"
          v-model:value="titleValue"
          @blur="handleUpdateTitle()"
          v-if="editingTitle"
        ></Input>
        <div class="title-text" @click="startEditTitle()" :title="title" v-else>
          {{ title }}
        </div>
      </div>
    </div>

    <div class="right">
      <Popover trigger="click" placement="bottom-start" v-model:value="mainMenuVisible">
        <template #content>
          <PopoverMenuItem
            @click="
              openAIPPTDialog();
              mainMenuVisible = false;
            "
            >{{ $t('header.ai.aiGeneratePPT') }}</PopoverMenuItem
          >
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
        <div class="menu-item"><IconHamburgerButton class="icon" /></div>
      </Popover>
      <div class="group-menu-item">
        <div class="menu-item" v-tooltip="$t('header.presentation.slideShow')" @click="enterScreening()">
          <IconPpt class="icon" />
        </div>
        <Popover trigger="click" center>
          <template #content>
            <PopoverMenuItem @click="enterScreeningFromStart()">{{
              $t('header.presentation.fromBeginning')
            }}</PopoverMenuItem>
            <PopoverMenuItem @click="enterScreening()">{{
              $t('header.presentation.fromCurrentPage')
            }}</PopoverMenuItem>
          </template>
          <div class="arrow-btn"><IconDown class="arrow" /></div>
        </Popover>
      </div>
      <div
        class="menu-item"
        v-tooltip="$t('header.ai.aiGeneratePPT')"
        @click="
          openAIPPTDialog();
          mainMenuVisible = false;
        "
      >
        <span class="text ai">AI</span>
      </div>
      <div class="menu-item" v-tooltip="$t('header.file.exportFile')" @click="setDialogForExport('pptx')">
        <IconDownload class="icon" />
      </div>
      <a
        class="github-link"
        v-tooltip="$t('header.meta.copyright')"
        href="https://github.com/pipipi-pikachu/PPTist"
        target="_blank"
      >
        <div class="menu-item"><IconGithub class="icon" /></div>
      </a>
      <div class="menu-item" id="language-switcher">
        <LanguageSwitcher />
      </div>
    </div>

    <Drawer :width="320" v-model:visible="hotkeyDrawerVisible" placement="right">
      <HotkeyDoc />
      <template v-slot:title>{{ $t('header.tools.quickActions') }}</template>
    </Drawer>

    <FullscreenSpin :loading="exporting" :tip="$t('header.file.importing')" />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import useScreening from '@/hooks/useScreening';
import useImport from '@/hooks/useImport';
import useSlideHandler from '@/hooks/useSlideHandler';
import type { DialogForExportTypes } from '@/types/export';

import HotkeyDoc from './HotkeyDoc.vue';
import FileInput from '@/components/FileInput.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import Drawer from '@/components/Drawer.vue';
import Input from '@/components/Input.vue';
import Popover from '@/components/Popover.vue';
import PopoverMenuItem from '@/components/PopoverMenuItem.vue';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const { title } = storeToRefs(slidesStore);
const { enterScreening, enterScreeningFromStart } = useScreening();
const { importSpecificFile, importPPTXFile, exporting } = useImport();
const { resetSlides } = useSlideHandler();

const mainMenuVisible = ref(false);
const hotkeyDrawerVisible = ref(false);
const editingTitle = ref(false);
const titleInputRef = ref<InstanceType<typeof Input>>();
const titleValue = ref('');

const handleToggleSidebar = () => {
  document.dispatchEvent(new CustomEvent('toggleSidebar', {}));
};

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
</script>

<style lang="scss" scoped>
.editor-header {
  user-select: none;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}
.left,
.right {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.menu-item {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: $baseTextSize;
  padding: 0 10px;
  border-radius: $borderRadius;
  cursor: pointer;

  .icon {
    font-size: 18px;
    color: $gray-666;
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
  border-radius: $borderRadius;

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
  font-size: $baseTextSize;

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
    border-radius: $borderRadius;
    cursor: pointer;
    @include ellipsis-oneline();

    &:hover {
      background-color: $light-gray;
    }
  }
}
.github-link {
  display: inline-block;
  height: 30px;
}
</style>
