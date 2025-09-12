<template>
  <div class="element-positopn-panel">
    <div class="title title-panel">{{ $t('styling.position.single.layer') }}</div>
    <ButtonGroup class="row">
      <Button style="width: 50%" @click="orderElement(handleElement!, ElementOrderCommands.TOP)">
        <div class="center">
          <IconSendToBack class="btn-icon" />
          <p>{{ $t('styling.position.single.bringToFront') }}</p>
        </div>
      </Button>
      <Button style="width: 50%" @click="orderElement(handleElement!, ElementOrderCommands.BOTTOM)">
        <div class="center">
          <IconBringToFrontOne class="btn-icon" />
          <p>{{ $t('styling.position.single.sendToBack') }}</p>
        </div>
      </Button>
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button style="width: 50%" @click="orderElement(handleElement!, ElementOrderCommands.UP)">
        <div class="center">
          <IconBringToFront class="btn-icon" />
          <p>{{ $t('styling.position.single.moveUp') }}</p>
        </div>
      </Button>
      <Button style="width: 50%" @click="orderElement(handleElement!, ElementOrderCommands.DOWN)">
        <div class="center">
          <IconSentToBack class="btn-icon" />
          <p>{{ $t('styling.position.single.moveDown') }}</p>
        </div>
      </Button>
    </ButtonGroup>

    <Divider />

    <div class="title title-panel">{{ $t('styling.position.single.alignment') }}</div>
    <ButtonGroup class="row">
      <Button
        style="flex-grow: 1"
        v-tooltip="$t('styling.position.single.leftAlign')"
        @click="alignElementToCanvas(ElementAlignCommands.LEFT)"
        ><IconAlignLeft
      /></Button>
      <Button
        style="flex-grow: 1"
        v-tooltip="$t('styling.position.single.centerHorizontally')"
        @click="alignElementToCanvas(ElementAlignCommands.HORIZONTAL)"
        ><IconAlignVertically
      /></Button>
      <Button
        style="flex-grow: 1"
        v-tooltip="$t('styling.position.single.rightAlign')"
        @click="alignElementToCanvas(ElementAlignCommands.RIGHT)"
        ><IconAlignRight
      /></Button>
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button
        style="flex-grow: 1"
        v-tooltip="$t('styling.position.single.topAlign')"
        @click="alignElementToCanvas(ElementAlignCommands.TOP)"
        ><IconAlignTop
      /></Button>
      <Button
        style="flex-grow: 1"
        v-tooltip="$t('styling.position.single.centerVertically')"
        @click="alignElementToCanvas(ElementAlignCommands.VERTICAL)"
        ><IconAlignHorizontally
      /></Button>
      <Button
        style="flex-grow: 1"
        v-tooltip="$t('styling.position.single.bottomAlign')"
        @click="alignElementToCanvas(ElementAlignCommands.BOTTOM)"
        ><IconAlignBottom
      /></Button>
    </ButtonGroup>

    <Divider />
    <div class="title title-panel">{{ $t('styling.position.single.properties') }}</div>

    <div class="row">
      <div style="width: 45%">{{ $t('styling.position.single.horizontal') }}</div>
      <NumberInput
        :min="-1000"
        :step="5"
        :value="left"
        @update:value="(value) => updateLeft(value)"
        style="width: 100%"
      >
        <template #placeholder>{{ $t('styling.position.single.inputHorizontal') }}</template>
      </NumberInput>
    </div>
    <div class="row">
      <div style="width: 45%">{{ $t('styling.position.single.vertical') }}</div>
      <NumberInput
        :min="-1000"
        :step="5"
        :value="top"
        @update:value="(value) => updateTop(value)"
        style="width: 100%"
      >
        <template #placeholder>{{ $t('styling.position.single.inputVertical') }}</template>
      </NumberInput>
    </div>

    <template v-if="handleElement!.type !== 'line'">
      <div class="row">
        <div style="width: 45%">{{ $t('styling.position.single.width') }}</div>
        <NumberInput
          :min="minSize"
          :max="1500"
          :step="5"
          :disabled="isVerticalText"
          :value="width"
          @update:value="(value) => updateWidth(value)"
          style="width: 100%"
        >
          <template #placeholder>{{ $t('styling.position.single.inputWidth') }}</template>
        </NumberInput>
      </div>
      <template v-if="['image', 'shape', 'audio'].includes(handleElement!.type)">
        <IconLock
          style="width: 10%"
          class="icon-btn active"
          v-tooltip="$t('styling.position.single.unlockAspectRatio')"
          @click="updateFixedRatio(false)"
          v-if="fixedRatio"
        />
        <IconUnlock
          style="width: 10%"
          class="icon-btn"
          v-tooltip="$t('styling.position.single.lockAspectRatio')"
          @click="updateFixedRatio(true)"
          v-else
        />
      </template>
      <div style="width: 10%" v-else></div>
      <div class="row">
        <div style="width: 45%">{{ $t('styling.position.single.height') }}</div>
        <NumberInput
          :min="minSize"
          :max="800"
          :step="5"
          :disabled="isHorizontalText || handleElement!.type === 'table'"
          :value="height"
          @update:value="(value) => updateHeight(value)"
          style="width: 100%"
        >
          <template #placeholder>{{ $t('styling.position.single.inputHeight') }}</template>
        </NumberInput>
      </div>
    </template>

    <template v-if="!['line', 'video', 'audio'].includes(handleElement!.type)">
      <Divider />

      <div class="row">
        <NumberInput
          :min="-180"
          :max="180"
          :step="5"
          :value="rotate"
          @update:value="(value) => updateRotate(value)"
        >
          <template #prefix> {{ $t('styling.position.single.rotation') }} </template>
        </NumberInput>
      </div>

      <div class="row flex gap-2">
        <Button @click="updateRotate45('-')" class="flex-1"><IconRotate /> -45°</Button>
        <Button @click="updateRotate45('+')" class="flex-1">
          <IconRotate :style="{ transform: 'rotateY(180deg)' }" /> +45°
        </Button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { round } from 'lodash';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { PPTElement } from '@/types/slides';
import { ElementAlignCommands, ElementOrderCommands } from '@/types/edit';
import { MIN_SIZE } from '@/configs/element';
import { SHAPE_PATH_FORMULAS } from '@/configs/shapes';
import useOrderElement from '@/hooks/useOrderElement';
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import Divider from '@/components/Divider.vue';
import Button from '@/components/Button.vue';
import NumberInput from '@/components/NumberInput.vue';
import ButtonGroup from '@/components/ButtonGroup.vue';

const slidesStore = useSlidesStore();
const { handleElement, handleElementId } = storeToRefs(useMainStore());

const left = ref(0);
const top = ref(0);
const width = ref(0);
const height = ref(0);
const rotate = ref(0);
const fixedRatio = ref(false);

const minSize = computed(() => {
  if (!handleElement.value) return 20;
  return MIN_SIZE[handleElement.value.type] || 20;
});

const isHorizontalText = computed(() => {
  return handleElement.value?.type === 'text' && !handleElement.value.vertical;
});
const isVerticalText = computed(() => {
  return handleElement.value?.type === 'text' && handleElement.value.vertical;
});

watch(
  handleElement,
  () => {
    if (!handleElement.value) return;

    left.value = round(handleElement.value.left, 1);
    top.value = round(handleElement.value.top, 1);

    fixedRatio.value = 'fixedRatio' in handleElement.value && !!handleElement.value.fixedRatio;

    if (handleElement.value.type !== 'line') {
      width.value = round(handleElement.value.width, 1);
      height.value = round(handleElement.value.height, 1);
      rotate.value =
        'rotate' in handleElement.value && handleElement.value.rotate !== undefined
          ? round(handleElement.value.rotate, 1)
          : 0;
    }
  },
  { deep: true, immediate: true }
);

const { orderElement } = useOrderElement();
const { alignElementToCanvas } = useAlignElementToCanvas();

const { addHistorySnapshot } = useHistorySnapshot();

// Set element position
const updateLeft = (value: number) => {
  const props = { left: value };
  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};
const updateTop = (value: number) => {
  const props = { top: value };
  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};

// Set element width, height, rotation angle
// When setting width and height for shapes, need to check if shape path needs to be updated
const updateShapePathData = (width: number, height: number) => {
  if (
    handleElement.value &&
    handleElement.value.type === 'shape' &&
    'pathFormula' in handleElement.value &&
    handleElement.value.pathFormula
  ) {
    const pathFormula = SHAPE_PATH_FORMULAS[handleElement.value.pathFormula];

    let path = '';
    if ('editable' in pathFormula && pathFormula.editable)
      path = pathFormula.formula(width, height, handleElement.value.keypoints!);
    else path = pathFormula.formula(width, height);

    return {
      viewBox: [width, height],
      path,
    };
  }
  return null;
};

const updateWidth = (value: number) => {
  if (!handleElement.value) return;
  if (handleElement.value.type === 'line' || isVerticalText.value) return;

  let h = height.value;

  if (fixedRatio.value) {
    const ratio = width.value / height.value;
    h = value / ratio < minSize.value ? minSize.value : value / ratio;
  }
  let props: Partial<PPTElement> = { width: value, height: h };

  const shapePathData = updateShapePathData(value, h);
  if (shapePathData) {
    props = {
      width: value,
      height: h,
      ...shapePathData,
    };
  }

  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};

const updateHeight = (value: number) => {
  if (!handleElement.value) return;
  if (handleElement.value.type === 'line' || handleElement.value.type === 'table' || isHorizontalText.value)
    return;

  let w = width.value;

  if (fixedRatio.value) {
    const ratio = width.value / height.value;
    w = value * ratio < minSize.value ? minSize.value : value * ratio;
  }
  let props: Partial<PPTElement> = { width: w, height: value };

  const shapePathData = updateShapePathData(w, value);
  if (shapePathData) {
    props = {
      width: w,
      height: value,
      ...shapePathData,
    };
  }

  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};

const updateRotate = (value: number) => {
  const props = { rotate: value };
  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};

// Lock element aspect ratio
const updateFixedRatio = (value: boolean) => {
  const props = { fixedRatio: value };
  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};

// Rotate element by 45 degrees (clockwise or counterclockwise)
const updateRotate45 = (command: '+' | '-') => {
  let _rotate = Math.floor(rotate.value / 45) * 45;
  if (command === '+') _rotate = _rotate + 45;
  else if (command === '-') _rotate = _rotate - 45;

  if (_rotate < -180) _rotate = -180;
  if (_rotate > 180) _rotate = 180;

  const props = { rotate: _rotate };
  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};
</script>

<style lang="scss" scoped>
@use 'sass:color';
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  margin-bottom: 10px;
}
.label {
  text-align: center;
}
.btn-icon {
  margin-right: 3px;
}
.icon-btn {
  cursor: pointer;
  padding: 6px;

  &:hover {
    color: $themeColor;
  }

  &.active {
    color: $lightGray;
    background-color: $themeColor;
    border-radius: 50%;

    &:hover {
      background-color: color.adjust($themeColor, $lightness: -10%);
    }
  }
}
.text-btn {
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    background-color: #efefef;
    border-radius: $borderRadius;
  }
}
</style>
