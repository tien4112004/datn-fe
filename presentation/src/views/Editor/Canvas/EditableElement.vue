<template>
  <div
    class="editable-element"
    ref="elementRef"
    :id="`editable-element-${elementInfo.id}`"
    :style="{
      zIndex: elementIndex,
    }"
  >
    <component
      :is="currentElementComponent"
      :elementInfo="elementInfo"
      :selectElement="selectElement"
      :contextmenus="contextmenus"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ELEMENT_TYPES, type PPTElement } from '@/types/slides';
import type { ContextmenuItem } from '@/components/Contextmenu/types';
import { useI18n } from 'vue-i18n';

import useLockElement from '@/hooks/useLockElement';
import useDeleteElement from '@/hooks/useDeleteElement';
import useCombineElement from '@/hooks/useCombineElement';
import useOrderElement from '@/hooks/useOrderElement';
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas';
import useCopyAndPasteElement from '@/hooks/useCopyAndPasteElement';
import useSelectElement from '@/hooks/useSelectElement';

import { ElementOrderCommands, ElementAlignCommands } from '@/types/edit';

import ImageElement from '@/views/components/element/ImageElement/index.vue';
import TextElement from '@/views/components/element/TextElement/index.vue';
import ShapeElement from '@/views/components/element/ShapeElement/index.vue';
import LineElement from '@/views/components/element/LineElement/index.vue';
import ChartElement from '@/views/components/element/ChartElement/index.vue';
import TableElement from '@/views/components/element/TableElement/index.vue';
import LatexElement from '@/views/components/element/LatexElement/index.vue';
import VideoElement from '@/views/components/element/VideoElement/index.vue';
import AudioElement from '@/views/components/element/AudioElement/index.vue';

const props = defineProps<{
  elementInfo: PPTElement;
  elementIndex: number;
  isMultiSelect: boolean;
  selectElement: (e: MouseEvent | TouchEvent, element: PPTElement, canMove?: boolean) => void;
  openLinkDialog: () => void;
}>();

const { t } = useI18n();

const currentElementComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ELEMENT_TYPES.IMAGE]: ImageElement,
    [ELEMENT_TYPES.TEXT]: TextElement,
    [ELEMENT_TYPES.SHAPE]: ShapeElement,
    [ELEMENT_TYPES.LINE]: LineElement,
    [ELEMENT_TYPES.CHART]: ChartElement,
    [ELEMENT_TYPES.TABLE]: TableElement,
    [ELEMENT_TYPES.LATEX]: LatexElement,
    [ELEMENT_TYPES.VIDEO]: VideoElement,
    [ELEMENT_TYPES.AUDIO]: AudioElement,
  };
  return elementTypeMap[props.elementInfo.type] || null;
});

const { orderElement } = useOrderElement();
const { alignElementToCanvas } = useAlignElementToCanvas();
const { combineElements, uncombineElements } = useCombineElement();
const { deleteElement } = useDeleteElement();
const { lockElement, unlockElement } = useLockElement();
const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement();
const { selectAllElements } = useSelectElement();

// Context menu items
const contextmenus = (): ContextmenuItem[] => {
  if (props.elementInfo.lock) {
    return [
      {
        text: t('canvas.editableElement.unlock'),
        handler: () => unlockElement(props.elementInfo),
      },
    ];
  }

  return [
    {
      text: t('canvas.editableElement.cut'),
      subText: 'Ctrl + X',
      handler: cutElement,
    },
    {
      text: t('canvas.editableElement.copy'),
      subText: 'Ctrl + C',
      handler: copyElement,
    },
    {
      text: t('canvas.editableElement.paste'),
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    { divider: true },
    {
      text: t('canvas.editableElement.alignHorizontalCenter'),
      handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
      children: [
        {
          text: t('canvas.editableElement.alignCenter'),
          handler: () => alignElementToCanvas(ElementAlignCommands.CENTER),
        },
        {
          text: t('canvas.editableElement.alignHorizontalCenter'),
          handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
        },
        {
          text: t('canvas.editableElement.alignLeft'),
          handler: () => alignElementToCanvas(ElementAlignCommands.LEFT),
        },
        {
          text: t('canvas.editableElement.alignRight'),
          handler: () => alignElementToCanvas(ElementAlignCommands.RIGHT),
        },
      ],
    },
    {
      text: t('canvas.editableElement.alignVerticalCenter'),
      handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
      children: [
        {
          text: t('canvas.editableElement.alignCenter'),
          handler: () => alignElementToCanvas(ElementAlignCommands.CENTER),
        },
        {
          text: t('canvas.editableElement.alignVerticalCenter'),
          handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
        },
        {
          text: t('canvas.editableElement.alignTop'),
          handler: () => alignElementToCanvas(ElementAlignCommands.TOP),
        },
        {
          text: t('canvas.editableElement.alignBottom'),
          handler: () => alignElementToCanvas(ElementAlignCommands.BOTTOM),
        },
      ],
    },
    { divider: true },
    {
      text: t('canvas.editableElement.bringToFront'),
      disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => orderElement(props.elementInfo, ElementOrderCommands.TOP),
      children: [
        {
          text: t('canvas.editableElement.bringToFront'),
          handler: () => orderElement(props.elementInfo, ElementOrderCommands.TOP),
        },
        {
          text: t('canvas.editableElement.bringForward'),
          handler: () => orderElement(props.elementInfo, ElementOrderCommands.UP),
        },
      ],
    },
    {
      text: t('canvas.editableElement.sendToBack'),
      disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => orderElement(props.elementInfo, ElementOrderCommands.BOTTOM),
      children: [
        {
          text: t('canvas.editableElement.sendToBack'),
          handler: () => orderElement(props.elementInfo, ElementOrderCommands.BOTTOM),
        },
        {
          text: t('canvas.editableElement.sendBackward'),
          handler: () => orderElement(props.elementInfo, ElementOrderCommands.DOWN),
        },
      ],
    },
    { divider: true },
    {
      text: t('canvas.editableElement.setLink'),
      handler: props.openLinkDialog,
    },
    {
      text: props.elementInfo.groupId
        ? t('canvas.editableElement.ungroup')
        : t('canvas.editableElement.group'),
      subText: 'Ctrl + G',
      handler: props.elementInfo.groupId ? uncombineElements : combineElements,
      hide: !props.isMultiSelect,
    },
    {
      text: t('canvas.editableElement.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllElements,
    },
    {
      text: t('canvas.editableElement.lock'),
      subText: 'Ctrl + L',
      handler: lockElement,
    },
    {
      text: t('canvas.editableElement.delete'),
      subText: 'Delete',
      handler: deleteElement,
    },
  ];
};
</script>
