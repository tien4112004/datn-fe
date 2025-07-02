import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';

export default (canvasRef: Ref<HTMLElement | undefined>) => {
  const viewportLeft = ref(0);
  const viewportTop = ref(0);

  const mainStore = useMainStore();
  const { canvasPercentage, canvasDragged } = storeToRefs(mainStore);
  const { viewportRatio, viewportSize } = storeToRefs(useSlidesStore());

  // Initialize canvas viewport position
  const initViewportPosition = () => {
    if (!canvasRef.value) return;
    const canvasWidth = canvasRef.value.clientWidth;
    const canvasHeight = canvasRef.value.clientHeight;

    if (canvasHeight / canvasWidth > viewportRatio.value) {
      const viewportActualWidth = canvasWidth * (canvasPercentage.value / 100);
      mainStore.setCanvasScale(viewportActualWidth / viewportSize.value);
      viewportLeft.value = (canvasWidth - viewportActualWidth) / 2;
      viewportTop.value = (canvasHeight - viewportActualWidth * viewportRatio.value) / 2;
    } else {
      const viewportActualHeight = canvasHeight * (canvasPercentage.value / 100);
      mainStore.setCanvasScale(viewportActualHeight / (viewportSize.value * viewportRatio.value));
      viewportLeft.value = (canvasWidth - viewportActualHeight / viewportRatio.value) / 2;
      viewportTop.value = (canvasHeight - viewportActualHeight) / 2;
    }
  };

  // Update canvas viewport position
  const setViewportPosition = (newValue: number, oldValue: number) => {
    if (!canvasRef.value) return;
    const canvasWidth = canvasRef.value.clientWidth;
    const canvasHeight = canvasRef.value.clientHeight;

    if (canvasHeight / canvasWidth > viewportRatio.value) {
      const newViewportActualWidth = canvasWidth * (newValue / 100);
      const oldViewportActualWidth = canvasWidth * (oldValue / 100);
      const newViewportActualHeight = newViewportActualWidth * viewportRatio.value;
      const oldViewportActualHeight = oldViewportActualWidth * viewportRatio.value;

      mainStore.setCanvasScale(newViewportActualWidth / viewportSize.value);

      viewportLeft.value = viewportLeft.value - (newViewportActualWidth - oldViewportActualWidth) / 2;
      viewportTop.value = viewportTop.value - (newViewportActualHeight - oldViewportActualHeight) / 2;
    } else {
      const newViewportActualHeight = canvasHeight * (newValue / 100);
      const oldViewportActualHeight = canvasHeight * (oldValue / 100);
      const newViewportActualWidth = newViewportActualHeight / viewportRatio.value;
      const oldViewportActualWidth = oldViewportActualHeight / viewportRatio.value;

      mainStore.setCanvasScale(newViewportActualHeight / (viewportSize.value * viewportRatio.value));

      viewportLeft.value = viewportLeft.value - (newViewportActualWidth - oldViewportActualWidth) / 2;
      viewportTop.value = viewportTop.value - (newViewportActualHeight - oldViewportActualHeight) / 2;
    }
  };

  // Reset/update viewport position when viewport scale or ratio changes
  watch(canvasPercentage, setViewportPosition);
  watch(viewportRatio, initViewportPosition);
  watch(viewportSize, initViewportPosition);

  // Reset viewport position when canvas drag state changes (restore)
  watch(canvasDragged, () => {
    if (!canvasDragged.value) initViewportPosition();
  });

  // Canvas viewport position and size styles
  const viewportStyles = computed(() => ({
    width: viewportSize.value,
    height: viewportSize.value * viewportRatio.value,
    left: viewportLeft.value,
    top: viewportTop.value,
  }));

  // Listen for canvas size changes and reset viewport position
  const resizeObserver = new ResizeObserver(initViewportPosition);

  onMounted(() => {
    if (canvasRef.value) resizeObserver.observe(canvasRef.value);
  });
  onUnmounted(() => {
    if (canvasRef.value) resizeObserver.unobserve(canvasRef.value);
  });

  // Drag canvas
  const dragViewport = (e: MouseEvent) => {
    let isMouseDown = true;

    const startPageX = e.pageX;
    const startPageY = e.pageY;

    const originLeft = viewportLeft.value;
    const originTop = viewportTop.value;

    document.onmousemove = (e) => {
      if (!isMouseDown) return;

      const currentPageX = e.pageX;
      const currentPageY = e.pageY;

      viewportLeft.value = originLeft + (currentPageX - startPageX);
      viewportTop.value = originTop + (currentPageY - startPageY);
    };

    document.onmouseup = () => {
      isMouseDown = false;
      document.onmousemove = null;
      document.onmouseup = null;

      mainStore.setCanvasDragged(true);
    };
  };

  return {
    viewportStyles,
    dragViewport,
  };
};
