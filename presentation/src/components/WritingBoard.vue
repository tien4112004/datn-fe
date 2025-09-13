<template>
  <div class="writing-board" ref="writingBoardRef">
    <div class="blackboard" v-if="blackboard"></div>

    <canvas
      class="canvas"
      ref="canvasRef"
      :style="{
        width: canvasWidth + 'px',
        height: canvasHeight + 'px',
      }"
      @mousedown="($event) => handleMousedown($event)"
      @mousemove="($event) => handleMousemove($event)"
      @mouseup="handleMouseup()"
      @touchstart="($event) => handleMousedown($event)"
      @touchmove="($event) => handleMousemove($event)"
      @touchend="
        handleMouseup();
        mouseInCanvas = false;
      "
      @mouseleave="
        handleMouseup();
        mouseInCanvas = false;
      "
      @mouseenter="mouseInCanvas = true"
    ></canvas>

    <template v-if="mouseInCanvas">
      <div
        class="eraser"
        :style="{
          left: mouse.x - rubberSize / 2 + 'px',
          top: mouse.y - rubberSize / 2 + 'px',
          width: rubberSize + 'px',
          height: rubberSize + 'px',
        }"
        v-if="model === 'eraser'"
      ></div>
      <div
        class="pen"
        :style="{
          left: mouse.x - penSize / 2 + 'px',
          top: mouse.y - penSize * 6 + penSize / 2 + 'px',
          color: color,
        }"
        v-if="model === 'pen'"
      >
        <IconWrite class="icon" :size="penSize * 6" />
      </div>
      <div
        class="pen"
        :style="{
          left: mouse.x - markSize / 2 + 'px',
          top: mouse.y + 'px',
          color: color,
        }"
        v-if="model === 'mark'"
      >
        <IconHighLight class="icon" :size="markSize * 1.5" />
      </div>
      <div
        class="pen"
        :style="{
          left: mouse.x - 20 + 'px',
          top: mouse.y - 20 + 'px',
          color: color,
        }"
        v-if="model === 'shape'"
      >
        <IconPlus class="icon" :size="40" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    color?: string;
    model?: 'pen' | 'eraser' | 'mark' | 'shape';
    shapeType?: 'rect' | 'circle' | 'arrow';
    blackboard?: boolean;
    penSize?: number;
    markSize?: number;
    rubberSize?: number;
    shapeSize?: number;
  }>(),
  {
    color: '#ffcc00',
    model: 'pen',
    shapeType: 'rect',
    blackboard: false,
    penSize: 6,
    markSize: 24,
    rubberSize: 80,
    shapeSize: 4,
  }
);

const emit = defineEmits<{
  (event: 'end'): void;
}>();

let ctx: CanvasRenderingContext2D | null = null;
const writingBoardRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();

let lastPos = {
  x: 0,
  y: 0,
};
let isMouseDown = false;
let lastTime = 0;
let lastLineWidth = -1;

let initialImageData: ImageData | null = null;

// Mouse position coordinates: used for pen or eraser position following
const mouse = ref({
  x: 0,
  y: 0,
});

// Whether the mouse is within the canvas range: only show pen or eraser when within range
const mouseInCanvas = ref(false);

// Listen for canvas size updates
const canvasWidth = ref(0);
const canvasHeight = ref(0);

const widthScale = computed(() => (canvasRef.value ? canvasWidth.value / canvasRef.value.width : 1));
const heightScale = computed(() => (canvasRef.value ? canvasHeight.value / canvasRef.value.height : 1));

const updateCanvasSize = () => {
  if (!writingBoardRef.value) return;
  canvasWidth.value = writingBoardRef.value.clientWidth;
  canvasHeight.value = writingBoardRef.value.clientHeight;
};
const resizeObserver = new ResizeObserver(updateCanvasSize);
onMounted(() => {
  if (writingBoardRef.value) resizeObserver.observe(writingBoardRef.value);
});
onUnmounted(() => {
  if (writingBoardRef.value) resizeObserver.unobserve(writingBoardRef.value);
});

// Initialize canvas
const initCanvas = () => {
  if (!canvasRef.value || !writingBoardRef.value) return;

  ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  canvasRef.value.width = writingBoardRef.value.clientWidth;
  canvasRef.value.height = writingBoardRef.value.clientHeight;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
};
onMounted(initCanvas);

// Update canvas ctx configuration when switching pen modes
const updateCtx = () => {
  if (!ctx) return;
  if (props.model === 'mark') {
    ctx.globalCompositeOperation = 'xor';
    ctx.globalAlpha = 0.5;
  } else if (props.model === 'pen' || props.model === 'shape') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
};
watch(() => props.model, updateCtx);

// Draw pen ink method
const draw = (posX: number, posY: number, lineWidth: number) => {
  if (!ctx) return;

  const lastPosX = lastPos.x;
  const lastPosY = lastPos.y;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = props.color;
  ctx.beginPath();
  ctx.moveTo(lastPosX, lastPosY);
  ctx.lineTo(posX, posY);
  ctx.stroke();
  ctx.closePath();
};

// Erase ink method
const erase = (posX: number, posY: number) => {
  if (!ctx || !canvasRef.value) return;
  const lastPosX = lastPos.x;
  const lastPosY = lastPos.y;

  const radius = props.rubberSize / 2;

  const sinRadius = radius * Math.sin(Math.atan((posY - lastPosY) / (posX - lastPosX)));
  const cosRadius = radius * Math.cos(Math.atan((posY - lastPosY) / (posX - lastPosX)));
  const rectPoint1: [number, number] = [lastPosX + sinRadius, lastPosY - cosRadius];
  const rectPoint2: [number, number] = [lastPosX - sinRadius, lastPosY + cosRadius];
  const rectPoint3: [number, number] = [posX + sinRadius, posY - cosRadius];
  const rectPoint4: [number, number] = [posX - sinRadius, posY + cosRadius];

  ctx.save();
  ctx.beginPath();
  ctx.arc(posX, posY, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...rectPoint1);
  ctx.lineTo(...rectPoint3);
  ctx.lineTo(...rectPoint4);
  ctx.lineTo(...rectPoint2);
  ctx.closePath();
  ctx.clip();
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  ctx.restore();
};

// Calculate the distance between two mouse movements
const getDistance = (posX: number, posY: number) => {
  const lastPosX = lastPos.x;
  const lastPosY = lastPos.y;
  return Math.sqrt((posX - lastPosX) * (posX - lastPosX) + (posY - lastPosY) * (posY - lastPosY));
};

// Calculate drawing speed based on distance s and time t between two mouse movements, faster speed means thinner ink
const getLineWidth = (s: number, t: number) => {
  const maxV = 10;
  const minV = 0.1;
  const maxWidth = props.penSize;
  const minWidth = 3;
  const v = s / t;
  let lineWidth;

  if (v <= minV) lineWidth = maxWidth;
  else if (v >= maxV) lineWidth = minWidth;
  else lineWidth = maxWidth - (v / maxV) * maxWidth;

  if (lastLineWidth === -1) return lineWidth;
  return (lineWidth * 1) / 3 + (lastLineWidth * 2) / 3;
};

// Shape drawing
const drawShape = (currentX: number, currentY: number) => {
  if (!ctx || !initialImageData) return;

  ctx.putImageData(initialImageData, 0, 0);

  const startX = lastPos.x;
  const startY = lastPos.y;

  ctx.save();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  if (props.shapeType === 'rect') {
    const width = currentX - startX;
    const height = currentY - startY;
    ctx.rect(startX, startY, width, height);
  } else if (props.shapeType === 'circle') {
    const width = currentX - startX;
    const height = currentY - startY;
    const centerX = startX + width / 2;
    const centerY = startY + height / 2;
    const radiusX = Math.abs(width) / 2;
    const radiusY = Math.abs(height) / 2;

    ctx.ellipse(centerX, centerY, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI * 2);
  } else if (props.shapeType === 'arrow') {
    const dx = currentX - startX;
    const dy = currentY - startY;
    const angle = Math.atan2(dy, dx);
    const arrowLength = Math.max(props.shapeSize, 4) * 2;

    const endX = currentX - Math.cos(angle) * arrowLength;
    const endY = currentY - Math.sin(angle) * arrowLength;

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
  }

  ctx.strokeStyle = props.color;
  ctx.lineWidth = props.shapeSize;
  ctx.stroke();
  ctx.restore();

  if (props.shapeType === 'arrow') {
    const dx = currentX - startX;
    const dy = currentY - startY;
    const angle = Math.atan2(dy, dx);

    const arrowLength = Math.max(props.shapeSize, 4) * 2.6;
    const arrowWidth = Math.max(props.shapeSize, 4) * 1.6;

    const arrowBaseX = currentX - Math.cos(angle) * arrowLength;
    const arrowBaseY = currentY - Math.sin(angle) * arrowLength;

    ctx.save();
    ctx.beginPath();

    ctx.moveTo(currentX, currentY);

    const leftX = arrowBaseX + arrowWidth * Math.cos(angle + Math.PI / 2);
    const leftY = arrowBaseY + arrowWidth * Math.sin(angle + Math.PI / 2);
    const rightX = arrowBaseX + arrowWidth * Math.cos(angle - Math.PI / 2);
    const rightY = arrowBaseY + arrowWidth * Math.sin(angle - Math.PI / 2);

    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();

    ctx.fillStyle = props.color;
    ctx.fill();
    ctx.restore();
  }
};

// Path operation
const handleMove = (x: number, y: number) => {
  const time = new Date().getTime();

  if (props.model === 'pen') {
    const s = getDistance(x, y);
    const t = time - lastTime;
    const lineWidth = getLineWidth(s, t);

    draw(x, y, lineWidth);
    lastLineWidth = lineWidth;

    lastPos = { x, y };
    lastTime = new Date().getTime();
  } else if (props.model === 'mark') {
    draw(x, y, props.markSize);
    lastPos = { x, y };
  } else if (props.model === 'eraser') {
    erase(x, y);
    lastPos = { x, y };
  } else if (props.model === 'shape') {
    drawShape(x, y);
  }
};

// Get mouse position relative to canvas
const getMouseOffsetPosition = (e: MouseEvent | TouchEvent) => {
  if (!canvasRef.value) return [0, 0];
  const event = e instanceof MouseEvent ? e : e.changedTouches[0];
  const canvasRect = canvasRef.value.getBoundingClientRect();
  const x = event.pageX - canvasRect.x;
  const y = event.pageY - canvasRect.y;
  return [x, y];
};

// Handle mouse (touch) events
// Prepare to start drawing/erasing ink (pen down)
const handleMousedown = (e: MouseEvent | TouchEvent) => {
  const [mouseX, mouseY] = getMouseOffsetPosition(e);
  const x = mouseX / widthScale.value;
  const y = mouseY / heightScale.value;

  if (props.model === 'shape') {
    initialImageData = ctx!.getImageData(0, 0, canvasRef.value!.width, canvasRef.value!.height);
  }
  isMouseDown = true;
  lastPos = { x, y };
  lastTime = new Date().getTime();

  if (!(e instanceof MouseEvent)) {
    mouse.value = { x: mouseX, y: mouseY };
    mouseInCanvas.value = true;
  }
};

// Start drawing/erasing ink (move)
const handleMousemove = (e: MouseEvent | TouchEvent) => {
  const [mouseX, mouseY] = getMouseOffsetPosition(e);
  const x = mouseX / widthScale.value;
  const y = mouseY / heightScale.value;

  mouse.value = { x: mouseX, y: mouseY };

  if (isMouseDown) handleMove(x, y);
};

// End drawing/erasing ink (pen up)
const handleMouseup = () => {
  if (!isMouseDown) return;
  isMouseDown = false;
  emit('end');
};

// Clear canvas
const clearCanvas = () => {
  if (!ctx || !canvasRef.value) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  emit('end');
};

// Get DataURL
const getImageDataURL = () => {
  return canvasRef.value?.toDataURL();
};

// Set DataURL (draw image to canvas)
const setImageDataURL = (imageDataURL: string) => {
  if (!ctx || !canvasRef.value) return;

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  if (imageDataURL) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    const img = new Image();
    img.src = imageDataURL;
    img.onload = () => {
      ctx!.drawImage(img, 0, 0);
      updateCtx();
    };
  }
};

defineExpose({
  clearCanvas,
  getImageDataURL,
  setImageDataURL,
});
</script>

<style lang="scss" scoped>
.writing-board {
  z-index: 8;
  cursor: none;
  @include absolute-0();
}
.blackboard {
  width: 100%;
  height: 100%;
  background-color: #0f392b;
}
.canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.eraser,
.pen {
  pointer-events: none;
  position: absolute;
  z-index: 9;

  .icon {
    filter: drop-shadow(2px 2px 2px var(--muted-foreground));
  }
}
.eraser {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 4px solid rgb(from var(--muted-foreground) r g b / 0.15);
  color: rgb(from var(--muted-foreground) r g b / 0.75);
}
</style>
