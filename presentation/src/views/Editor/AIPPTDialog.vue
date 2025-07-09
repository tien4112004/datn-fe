<template>
  <div class="aippt-dialog">
    <div class="header">
      <span class="title">AIPPT</span>
      <span class="subtite" v-if="step === 'template'"
        >Select a suitable template from below to start generating PPT</span
      >
      <span class="subtite" v-else-if="step === 'outline'"
        >Confirm the content outline below (click to edit content, right-click to add/delete outline items),
        then start selecting templates</span
      >
      <span class="subtite" v-else
        >Enter your PPT topic below and add appropriate information such as industry, position, subject,
        purpose, etc.</span
      >
    </div>

    <template v-if="step === 'setup'">
      <Input
        class="input"
        ref="inputRef"
        v-model:value="keyword"
        :maxlength="50"
        placeholder="Please enter PPT topic, e.g.: College Student Career Planning"
        @enter="createOutline()"
      >
        <template #suffix>
          <span class="count">{{ keyword.length }} / 50</span>
          <div class="submit" type="primary" @click="createOutline()">
            <IconSend class="icon" /> AI Generate
          </div>
        </template>
      </Input>
      <div class="recommends">
        <div class="recommend" v-for="(item, index) in recommends" :key="index" @click="setKeyword(item)">
          {{ item }}
        </div>
      </div>
      <div class="configs">
        <div class="config-item">
          <div class="label">Language:</div>
          <Select
            style="width: 80px"
            v-model:value="language"
            :options="[
              { label: 'Chinese', value: 'Chinese' },
              { label: 'English', value: 'English' },
              { label: 'Japanese', value: 'Japanese' },
            ]"
          />
        </div>
        <div class="config-item">
          <div class="label">Style:</div>
          <Select
            style="width: 80px"
            v-model:value="style"
            :options="[
              { label: 'General', value: 'General' },
              { label: 'Academic', value: 'Academic' },
              { label: 'Workplace', value: 'Workplace' },
              { label: 'Education', value: 'Education' },
              { label: 'Marketing', value: 'Marketing' },
            ]"
          />
        </div>
        <div class="config-item">
          <div class="label">Model:</div>
          <Select
            style="width: 190px"
            v-model:value="model"
            :options="[
              { label: 'GLM-4-Flash', value: 'GLM-4-Flash' },
              { label: 'GLM-4-FlashX', value: 'GLM-4-FlashX' },
              {
                label: 'doubao-1.5-lite-32k',
                value: 'ark-doubao-1.5-lite-32k',
              },
              {
                label: 'doubao-seed-1.6-flash',
                value: 'ark-doubao-seed-1.6-flash',
              },
            ]"
          />
        </div>
        <div class="config-item">
          <div class="label">Images:</div>
          <Select
            style="width: 100px"
            v-model:value="img"
            :options="[
              { label: 'None', value: '' },
              { label: 'Mock Test', value: 'test' },
              { label: 'AI Search', value: 'ai-search', disabled: true },
              { label: 'AI Create', value: 'ai-create', disabled: true },
            ]"
          />
        </div>
      </div>
    </template>
    <div class="preview" v-if="step === 'outline'">
      <pre ref="outlineRef" v-if="outlineCreating">{{ outline }}</pre>
      <div class="outline-view" v-else>
        <OutlineEditor v-model:value="outline" />
      </div>
      <div class="btns" v-if="!outlineCreating">
        <Button class="btn" type="primary" @click="step = 'template'">Select Template</Button>

        <Button
          class="btn"
          @click="
            outline = ``;
            step = `setup`;
          "
          >Back to Regenerate</Button
        >
      </div>
    </div>
    <div class="select-template" v-if="step === 'template'">
      <div class="templates">
        <div
          class="template"
          :class="{ selected: selectedTemplate === template.id }"
          v-for="template in templates"
          :key="template.id"
          @click="selectedTemplate = template.id"
        >
          <img :src="template.cover" :alt="template.name" />
        </div>
      </div>
      <div class="btns">
        <Button class="btn" type="primary" @click="createPPT()">Generate</Button>
        <Button class="btn" @click="step = 'outline'">Back to Outline</Button>
      </div>
    </div>

    <FullscreenSpin :loading="loading" tip="AI is generating, please wait patiently..." />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import api from '@/services';
import useAIPPT from '@/hooks/useAIPPT';
import type { AIPPTSlide } from '@/types/AIPPT';
import type { Slide, SlideTheme } from '@/types/slides';
import message from '@/utils/message';
import { useMainStore, useSlidesStore } from '@/store';
import Input from '@/components/Input.vue';
import Button from '@/components/Button.vue';
import Select from '@/components/Select.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import OutlineEditor from '@/components/OutlineEditor.vue';

const mainStore = useMainStore();
const slideStore = useSlidesStore();
const { templates } = storeToRefs(slideStore);
const { AIPPT, presetImgPool, getMdContent } = useAIPPT();

const language = ref('Chinese');
const style = ref('General');
const img = ref('');
const keyword = ref('');
const outline = ref('');
const selectedTemplate = ref('template_1');
const loading = ref(false);
const outlineCreating = ref(false);
const outlineRef = ref<HTMLElement>();
const inputRef = ref<InstanceType<typeof Input>>();
const step = ref<'setup' | 'outline' | 'template'>('setup');
const model = ref('GLM-4-Flash');

const recommends = ref([
  'Company Annual Meeting Planning',
  'How Big Data Changes the World',
  'Restaurant Market Research',
  'AIGC Applications in Education',
  'How 5G Technology Changes Our Lives',
  'College Student Career Planning',
  '2025 Technology Frontiers',
  'Social Media and Brand Marketing',
  'Annual Work Summary and Outlook',
  'Blockchain Technology and Applications',
]);

onMounted(() => {
  setTimeout(() => {
    inputRef.value!.focus();
  }, 500);
});

const setKeyword = (value: string) => {
  keyword.value = value;
  inputRef.value!.focus();
};

const createOutline = async () => {
  if (!keyword.value) return message.error('Please enter PPT topic first');

  loading.value = true;
  outlineCreating.value = true;

  const stream = await api.AIPPT_Outline({
    content: keyword.value,
    language: language.value,
    model: model.value,
  });

  loading.value = false;
  step.value = 'outline';

  const reader: ReadableStreamDefaultReader = stream.body.getReader();
  const decoder = new TextDecoder('utf-8');

  const readStream = () => {
    reader.read().then(({ done, value }) => {
      if (done) {
        outline.value = getMdContent(outline.value);
        outline.value = outline.value
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/<think>[\s\S]*?<\/think>/g, '');
        outlineCreating.value = false;
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      outline.value += chunk;

      if (outlineRef.value) {
        outlineRef.value.scrollTop = outlineRef.value.scrollHeight + 20;
      }

      readStream();
    });
  };
  readStream();
};

const createPPT = async () => {
  loading.value = true;

  const stream = await api.AIPPT({
    content: outline.value,
    language: language.value,
    style: style.value,
    model: model.value,
  });

  if (img.value === 'test') {
    const imgs = await api.getMockData('imgs');
    presetImgPool(imgs);
  }

  const templateData = await api.getFileData(selectedTemplate.value);
  const templateSlides: Slide[] = templateData.slides;
  const templateTheme: SlideTheme = templateData.theme;

  const reader: ReadableStreamDefaultReader = stream.body.getReader();
  const decoder = new TextDecoder('utf-8');

  const readStream = () => {
    reader.read().then(({ done, value }) => {
      if (done) {
        loading.value = false;
        mainStore.setAIPPTDialogState(false);
        slideStore.setTheme(templateTheme);
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      try {
        const slide: AIPPTSlide = JSON.parse(chunk);
        AIPPT(templateSlides, [slide]);
      } catch (err) {
        // eslint-disable-next-line
        console.error(err);
      }

      readStream();
    });
  };
  readStream();
};
</script>

<style lang="scss" scoped>
.aippt-dialog {
  margin: -20px;
  padding: 30px;
}
.header {
  margin-bottom: 12px;

  .title {
    font-weight: 700;
    font-size: $lgTextSize;
    margin-right: 8px;
    background: linear-gradient(270deg, #d897fd, #33bcfc);
    background-clip: text;
    color: transparent;
    vertical-align: text-bottom;
    line-height: 1.1;
  }
  .subtite {
    color: #888;
    font-size: $xsTextSize;
  }
}
.preview {
  pre {
    max-height: 450px;
    padding: 10px;
    margin-bottom: 15px;
    background-color: #f1f1f1;
    overflow: auto;
  }
  .outline-view {
    max-height: 450px;
    padding: 10px;
    margin-bottom: 15px;
    background-color: #f1f1f1;
    overflow: auto;
  }
  .btns {
    display: flex;
    justify-content: center;
    align-items: center;

    .btn {
      width: 120px;
      margin: 0 5px;
    }
  }
}
.select-template {
  .templates {
    display: flex;
    margin-bottom: 10px;
    @include flex-grid-layout();

    .template {
      border: 2px solid $borderColor;
      border-radius: $borderRadius;
      width: 324px;
      height: 184px;
      margin-bottom: 12px;

      &:not(:nth-child(2n)) {
        margin-right: 12px;
      }

      &.selected {
        border-color: $themeColor;
      }

      img {
        width: 100%;
      }
    }
  }
  .btns {
    display: flex;
    justify-content: center;
    align-items: center;

    .btn {
      width: 120px;
      margin: 0 5px;
    }
  }
}
.recommends {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;

  .recommend {
    font-size: $xsTextSize;
    background-color: #f1f1f1;
    border-radius: $borderRadius;
    padding: 3px 5px;
    margin-right: 5px;
    margin-top: 5px;
    cursor: pointer;

    &:hover {
      color: $themeColor;
    }
  }
}
.configs {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;

  .config-item {
    font-size: $smTextSize;
    display: flex;
    align-items: center;
  }
}
.count {
  font-size: $xsTextSize;
  color: $gray-999;
  margin-right: 10px;
}
.submit {
  height: 20px;
  font-size: $xsTextSize;
  background-color: $themeColor;
  color: $background;
  display: flex;
  align-items: center;
  padding: 0 8px 0 6px;
  border-radius: $borderRadius;
  cursor: pointer;

  &:hover {
    background-color: $themeHoverColor;
  }

  .icon {
    font-size: $baseTextSize;
    margin-right: 3px;
  }
}
</style>
