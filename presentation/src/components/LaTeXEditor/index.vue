<template>
  <div class="latex-editor">
    <div class="container">
      <div class="left">
        <div class="input-area">
          <TextArea
            v-model:value="latex"
            :placeholder="t('elements.latex.editor.placeholder')"
            ref="textAreaRef"
          />
        </div>
        <div class="preview">
          <div class="placeholder" v-if="!latex">{{ $t('elements.latex.editor.formulaPreview') }}</div>
          <div class="preview-content" v-else>
            <FormulaContent :width="518" :height="138" :latex="latex" />
          </div>
        </div>
      </div>
      <div class="right">
        <Tabs :tabs="tabs" v-model:value="toolbarState" card />
        <div class="content">
          <div class="symbol" v-if="toolbarState === 'symbol'">
            <Tabs
              :tabs="symbolTabs"
              v-model:value="selectedSymbolKey"
              spaceBetween
              :tabsStyle="{ margin: '10px 10px 0' }"
            />
            <div class="symbol-pool">
              <div
                class="symbol-item"
                v-for="item in symbolPool"
                :key="item.latex"
                @click="insertSymbol(item.latex)"
              >
                <SymbolContent :latex="item.latex" />
              </div>
            </div>
          </div>
          <div class="formula" v-else>
            <div class="formula-item" v-for="item in formulaList" :key="item.label">
              <div class="formula-title">{{ item.label }}</div>
              <div class="formula-item-content" @click="latex = item.latex">
                <FormulaContent :width="236" :height="60" :latex="item.latex" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <Button class="btn" @click="emit('close')">{{ $t('elements.latex.editor.cancel') }}</Button>
      <Button class="btn" type="primary" @click="update()">{{ $t('elements.latex.editor.confirm') }}</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { hfmath } from './hfmath';
import { FORMULA_LIST, getSymbolList } from '@/configs/latex';
import message from '@/utils/message';

import FormulaContent from './FormulaContent.vue';
import SymbolContent from './SymbolContent.vue';
import Button from '../Button.vue';
import TextArea from '../TextArea.vue';
import Tabs from '../Tabs.vue';

const SYMBOL_LIST = getSymbolList().value;

interface TabItem {
  key: 'symbol' | 'formula';
  label: string;
}

const tabs: TabItem[] = [
  { label: t('elements.latex.editor.commonSymbols'), key: 'symbol' },
  { label: t('elements.latex.editor.presetFormulas'), key: 'formula' },
];

interface LatexResult {
  latex: string;
  path: string;
  w: number;
  h: number;
}

const props = withDefaults(
  defineProps<{
    value?: string;
  }>(),
  {
    value: '',
  }
);

const emit = defineEmits<{
  (event: 'update', payload: LatexResult): void;
  (event: 'close'): void;
}>();

const formulaList = FORMULA_LIST;

const symbolTabs = SYMBOL_LIST.map((item) => ({
  label: item.label,
  key: item.type,
}));

const latex = ref('');
const toolbarState = ref<'symbol' | 'formula'>('symbol');
const textAreaRef = ref<InstanceType<typeof TextArea>>();

const selectedSymbolKey = ref(SYMBOL_LIST[0].type);
const symbolPool = computed(() => {
  const selectedSymbol = SYMBOL_LIST.find((item) => item.type === selectedSymbolKey.value);
  return selectedSymbol?.children || [];
});

onMounted(() => {
  if (props.value) latex.value = props.value;
});

const update = () => {
  if (!latex.value) return message.error(t('elements.latex.editor.formulaCannotBeEmpty'));

  const eq = new hfmath(latex.value);
  const pathd = eq.pathd({});
  const box = eq.box({});

  emit('update', {
    latex: latex.value,
    path: pathd,
    w: box.w + 32,
    h: box.h + 32,
  });
};

const insertSymbol = (latex: string) => {
  if (!textAreaRef.value) return;
  textAreaRef.value.focus();
  document.execCommand('insertText', false, latex);
};
</script>

<style lang="scss" scoped>
.latex-editor {
  height: 560px;
}
.container {
  height: calc(100% - 50px);
  display: flex;
  justify-content: center;
}
.left {
  width: 540px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.input-area {
  flex: 1;

  textarea {
    height: 100% !important;
    border-color: var(--presentation-border) !important;
    padding: 10px !important;
    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;

    &:focus {
      box-shadow: none !important;
    }
  }
}
.preview {
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: 20px;
  border: 1px solid var(--presentation-border);
  user-select: none;
}
.placeholder {
  color: #888;
  font-size: 13px;
}
.preview-content {
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--presentation-radius);
}
.right {
  width: 300px;
  height: 100%;
  margin-left: 20px;
  border: solid 1px var(--presentation-border);
  background-color: var(--presentation-background);
  display: flex;
  flex-direction: column;
  user-select: none;
  border-radius: var(--presentation-radius);
}
.content {
  height: calc(100% - 40px);
  font-size: 0.8125rem;
  padding: 1rem;
}
.formula {
  height: 100%;
  padding: 12px;

  @include overflow-overlay();
}
.formula-item {
  & + .formula-item {
    margin-top: 10px;
  }

  .formula-title {
    margin-bottom: 5px;
  }
  .formula-item-content {
    height: 60px;
    padding: 5px;
    display: flex;
    align-items: center;
    background-color: var(--presentation-muted);
    cursor: pointer;
  }
}
.symbol {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.symbol-pool {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  padding: 12px;

  @include overflow-overlay();
}
.symbol-item {
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: var(--presentation-muted);
    cursor: pointer;
  }
}
.footer {
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  .btn {
    margin-left: 10px;
  }
}
</style>
