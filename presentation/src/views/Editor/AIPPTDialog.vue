<template>
  <div class="aippt-dialog">
    <div class="header">
      <span class="title">{{ $t('ai.dialog.title') }}</span>
      <span class="subtite" v-if="step === 'template'">
        {{ $t('ai.dialog.templateSubtitle') }}
      </span>
      <span class="subtite" v-else-if="step === 'outline'">
        {{ $t('ai.dialog.outlineSubtitle') }}
      </span>
      <span class="subtite" v-else>
        {{ $t('ai.dialog.setupSubtitle') }}
      </span>
    </div>

    <template v-if="step === 'setup'">
      <Input
        class="input"
        ref="inputRef"
        v-model:value="keyword"
        :maxlength="50"
        :placeholder="t('ai.dialog.topicPlaceholder')"
        @enter="createOutline()"
      >
        <template #suffix>
          <span class="count">{{ keyword.length }} / 50</span>
          <div class="submit" type="primary" @click="createOutline()">
            <IconSend class="icon" /> {{ $t('ai.dialog.generate') }}
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
          <div class="label">{{ $t('ai.dialog.settings.language') }}</div>
          <Select
            style="width: 120px"
            v-model:value="language"
            :options="[
              { label: $t('ai.dialog.languages.chinese'), value: 'Chinese' },
              { label: $t('ai.dialog.languages.english'), value: 'English' },
              { label: $t('ai.dialog.languages.japanese'), value: 'Japanese' },
            ]"
          />
        </div>
        <div class="config-item">
          <div class="label">{{ $t('ai.dialog.settings.style') }}</div>
          <Select
            style="width: 120px"
            v-model:value="style"
            :options="[
              { label: $t('ai.dialog.styles.general'), value: 'General' },
              { label: $t('ai.dialog.styles.academic'), value: 'Academic' },
              { label: $t('ai.dialog.styles.workplace'), value: 'Workplace' },
              { label: $t('ai.dialog.styles.education'), value: 'Education' },
              { label: $t('ai.dialog.styles.marketing'), value: 'Marketing' },
            ]"
          />
        </div>
        <div class="config-item">
          <div class="label">{{ $t('ai.dialog.settings.model') }}</div>
          <Select
            style="width: 190px"
            v-model:value="model"
            :options="[
              { label: $t('ai.dialog.models.glm4Flash'), value: 'GLM-4-Flash' },
              { label: $t('ai.dialog.models.glm4FlashX'), value: 'GLM-4-FlashX' },
              {
                label: $t('ai.dialog.models.doubaoLite'),
                value: 'ark-doubao-1.5-lite-32k',
              },
              {
                label: $t('ai.dialog.models.doubaoSeed'),
                value: 'ark-doubao-seed-1.6-flash',
              },
            ]"
          />
        </div>
        <div class="config-item">
          <div class="label">{{ $t('ai.dialog.settings.images') }}</div>
          <Select
            style="width: 100px"
            v-model:value="img"
            :options="[
              { label: $t('ai.dialog.imageOptions.none'), value: '' },
              { label: $t('ai.dialog.imageOptions.mockTest'), value: 'test' },
              { label: $t('ai.dialog.imageOptions.aiSearch'), value: 'ai-search', disabled: true },
              { label: $t('ai.dialog.imageOptions.aiCreate'), value: 'ai-create', disabled: true },
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
        <Button class="btn" type="primary" @click="step = 'template'">{{
          $t('ai.dialog.actions.selectTemplate')
        }}</Button>

        <Button
          class="btn"
          @click="
            outline = ``;
            step = `setup`;
          "
          >{{ $t('ai.dialog.actions.backToRegenerate') }}</Button
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
        <Button class="btn" type="primary" @click="createPPT()">{{ $t('ai.dialog.generate') }}</Button>
        <Button class="btn" @click="step = 'outline'">{{ $t('ai.dialog.actions.backToOutline') }}</Button>
      </div>
    </div>

    <FullscreenSpin :loading="loading" :tip="t('ai.dialog.status.loadingTip')" />
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
  t('ai.dialog.sampleTopics.companyAnnualMeetingPlanning'),
  t('ai.dialog.sampleTopics.howBigDataChangesTheWorld'),
  t('ai.dialog.sampleTopics.restaurantMarketResearch'),
  t('ai.dialog.sampleTopics.aigcApplicationsInEducation'),
  t('ai.dialog.sampleTopics.how5GTechnologyChangesOurLives'),
  t('ai.dialog.sampleTopics.collegeStudentCareerPlanning'),
  t('ai.dialog.sampleTopics.technologyFrontiers2025'),
  t('ai.dialog.sampleTopics.socialMediaAndBrandMarketing'),
  t('ai.dialog.sampleTopics.annualWorkSummaryAndOutlook'),
  t('ai.dialog.sampleTopics.blockchainTechnologyAndApplications'),
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
  if (!keyword.value) return message.error(t('ai.dialog.status.enterTopicError'));

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
    font-size: 1.125rem;
    margin-right: 8px;
    background: linear-gradient(270deg, #d897fd, #33bcfc);
    background-clip: text;
    color: transparent;
    vertical-align: text-bottom;
    line-height: 1.1;
  }
  .subtite {
    color: #888;
    font-size: 0.8125rem;
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
      border: 2px solid var(--border);
      border-radius: var(--radius);
      width: 324px;
      height: 184px;
      margin-bottom: 12px;

      &:not(:nth-child(2n)) {
        margin-right: 12px;
      }

      &.selected {
        border-color: var(--primary);
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
    font-size: 0.75rem;
    background-color: #f1f1f1;
    border-radius: var(--radius);
    padding: 3px 5px;
    margin-right: 5px;
    margin-top: 5px;
    cursor: pointer;

    &:hover {
      color: var(--primary);
    }
  }
}
.configs {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;

  .config-item {
    font-size: 0.8125rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}
.count {
  font-size: 0.75rem;
  color: #999999;
  margin-right: 10px;
}
.submit {
  height: 20px;
  font-size: 0.8125rem;
  background-color: var(--primary);
  color: var(--background);
  display: flex;
  align-items: center;
  padding: 0 8px 0 6px;
  border-radius: var(--radius);
  cursor: pointer;

  &:hover {
    background-color: var(--secondary);
  }

  .icon {
    font-size: 0.875rem;
    margin-right: 3px;
  }
}
</style>
