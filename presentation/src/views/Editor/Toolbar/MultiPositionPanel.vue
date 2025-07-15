<template>
  <div class="multi-position-panel">
    <ButtonGroup class="row">
      <Button
        style="flex: 1"
        v-tooltip="$t('styling.position.multi.leftAlign')"
        @click="alignElement(ElementAlignCommands.LEFT)"
        ><IconAlignLeft
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="$t('styling.position.multi.horizontalCenter')"
        @click="alignElement(ElementAlignCommands.HORIZONTAL)"
        ><IconAlignHorizontally
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="$t('styling.position.multi.rightAlign')"
        @click="alignElement(ElementAlignCommands.RIGHT)"
        ><IconAlignRight
      /></Button>
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button
        style="flex: 1"
        v-tooltip="$t('styling.position.multi.topAlign')"
        @click="alignElement(ElementAlignCommands.TOP)"
        ><IconAlignTop
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="$t('styling.position.multi.verticalCenter')"
        @click="alignElement(ElementAlignCommands.VERTICAL)"
        ><IconAlignVertically
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="$t('styling.position.multi.bottomAlign')"
        @click="alignElement(ElementAlignCommands.BOTTOM)"
        ><IconAlignBottom
      /></Button>
    </ButtonGroup>
    <ButtonGroup class="row" v-if="displayItemCount > 2">
      <Button style="flex: 1" @click="uniformHorizontalDisplay()">{{
        $t('styling.position.multi.horizontalDistribute')
      }}</Button>
      <Button style="flex: 1" @click="uniformVerticalDisplay()">{{
        $t('styling.position.multi.verticalDistribute')
      }}</Button>
    </ButtonGroup>

    <Divider />

    <ButtonGroup class="row">
      <Button :disabled="!canCombine" @click="combineElements()" style="flex: 1"
        ><IconGroup style="margin-right: 3px" />{{ $t('styling.position.multi.group') }}</Button
      >
      <Button :disabled="canCombine" @click="uncombineElements()" style="flex: 1"
        ><IconUngroup style="margin-right: 3px" />{{ $t('styling.position.multi.ungroup') }}</Button
      >
    </ButtonGroup>
  </div>
</template>

<script lang="ts" setup>
import { ElementAlignCommands } from '@/types/edit';
import useCombineElement from '@/hooks/useCombineElement';
import useAlignActiveElement from '@/hooks/useAlignActiveElement';
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas';
import useUniformDisplayElement from '@/hooks/useUniformDisplayElement';
import Divider from '@/components/Divider.vue';
import Button from '@/components/Button.vue';
import ButtonGroup from '@/components/ButtonGroup.vue';

const { canCombine, combineElements, uncombineElements } = useCombineElement();
const { alignActiveElement } = useAlignActiveElement();
const { alignElementToCanvas } = useAlignElementToCanvas();
const { displayItemCount, uniformHorizontalDisplay, uniformVerticalDisplay } = useUniformDisplayElement();

// Multi-select element alignment, need to first determine the state of currently selected elements:
// If the selected element is a group element, align it to the canvas;
// If the selected elements are not group elements or more than one group element (i.e., currently in combinable state), align these multiple (multiple groups) elements to each other.
const alignElement = (command: ElementAlignCommands) => {
  if (canCombine.value) alignActiveElement(command);
  else alignElementToCanvas(command);
};
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
