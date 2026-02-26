<template>
  <div class="file-input" @click="handleClick()">
    <slot></slot>
    <input
      class="input"
      type="file"
      name="upload"
      ref="inputRef"
      :accept="accept"
      @change="($event) => handleChange($event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    accept?: string;
    disabled?: boolean;
  }>(),
  {
    accept: 'image/*',
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: 'change', payload: FileList): void;
}>();

const inputRef = ref<HTMLInputElement>();

const handleClick = () => {
  if (!inputRef.value || props.disabled) return;
  inputRef.value.value = '';
  inputRef.value.click();
};
const handleChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files) emit('change', files);
};
</script>

<style lang="scss" scoped>
.input {
  display: none;
}

.file-input {
  display: flex;
  align-items: center;
}
</style>
