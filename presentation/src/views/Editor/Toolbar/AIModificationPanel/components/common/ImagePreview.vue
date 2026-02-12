<template>
  <div class="image-preview">
    <img :src="src" :alt="alt" class="preview-img" />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  src: string;
  alt?: string;
}

withDefaults(defineProps<Props>(), {
  alt: 'Image preview',
});
</script>

<style lang="scss" scoped>
.image-preview {
  border-radius: 6px;
  border: 1px solid var(--presentation-border);
  overflow: hidden;

  .preview-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
}
</style>
