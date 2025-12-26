<template>
  <div class="media-input">
    <Tabs :tabs="tabs" v-model:value="type" :tabsStyle="{ marginBottom: '15px' }" />

    <template v-if="type === 'video'">
      <Input v-model="videoSrc" :placeholder="t('toolbar.media.input.videoPlaceholder')" />
      <div class="btns">
        <FileInput accept="video/*" @change="(files) => uploadVideo(files)">
          <Button>{{ $t('toolbar.media.input.uploadLocalVideo') }}</Button>
        </FileInput>
        <div class="group">
          <Button @click="emit('close')" style="margin-right: 10px">{{ $t('ui.actions.cancel') }}</Button>
          <Button type="primary" @click="insertVideo()">{{ $t('ui.actions.confirm') }}</Button>
        </div>
      </div>
    </template>

    <template v-if="type === 'audio'">
      <Input v-model="audioSrc" :placeholder="t('toolbar.media.input.audioPlaceholder')" />
      <div class="btns">
        <FileInput accept="audio/*" @change="(files) => uploadAudio(files)">
          <Button>{{ $t('toolbar.media.input.uploadLocalAudio') }}</Button>
        </FileInput>
        <div class="group">
          <Button @click="emit('close')" style="margin-right: 10px">{{ $t('ui.actions.cancel') }}</Button>
          <Button type="primary" @click="insertAudio()">{{ $t('ui.actions.confirm') }}</Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import message from '@/utils/message';
import { MIME_MAP } from '@/configs/mime';
import Tabs from '@/components/Tabs.vue';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button.vue';
import FileInput from '@/components/FileInput.vue';

const { t } = useI18n();

type TypeKey = 'video' | 'audio';
interface TabItem {
  key: TypeKey;
  label: string;
}

const emit = defineEmits<{
  (event: 'insertVideo', payload: { src: string; ext?: string }): void;
  (event: 'insertAudio', payload: { src: string; ext?: string }): void;
  (event: 'close'): void;
}>();

const type = ref<TypeKey>('video');

const videoSrc = ref(
  'https://mazwai.com/videvo_files/video/free/2019-01/small_watermarked/181004_04_Dolphins-Whale_06_preview.webm'
);
const audioSrc = ref('https://freesound.org/data/previews/614/614107_11861866-lq.mp3');

const tabs: TabItem[] = [
  { key: 'video', label: t('toolbar.media.input.video') },
  { key: 'audio', label: t('toolbar.media.input.audio') },
];

const insertVideo = () => {
  if (!videoSrc.value) return message.error(t('toolbar.media.input.invalidVideoUrl'));
  emit('insertVideo', { src: videoSrc.value });
};

const insertAudio = () => {
  if (!audioSrc.value) return message.error(t('toolbar.media.input.invalidAudioUrl'));
  emit('insertAudio', { src: audioSrc.value });
};

const uploadVideo = (files: FileList) => {
  const file = files[0];
  if (!file) return;
  const ext = MIME_MAP[file.type] || '';
  emit('insertVideo', { src: URL.createObjectURL(file), ext });
};

const uploadAudio = (files: FileList) => {
  const file = files[0];
  if (!file) return;
  const ext = MIME_MAP[file.type] || '';
  emit('insertAudio', { src: URL.createObjectURL(file), ext });
};
</script>

<style lang="scss" scoped>
.media-input {
  width: 480px;
}
.btns {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
