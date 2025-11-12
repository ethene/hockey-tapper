<template>
  <div class="character-animation">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="character-canvas"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useAnimationController } from '@/composables/useAnimationController.js';
import { useCanvasScaling } from '@/composables/useCanvasScaling.js';

/**
 * Character Animation Component
 *
 * Renders character sprite animations on a canvas using the animation controller.
 * Supports state-based animations (idle, windup, hit, cooldown).
 * Responsive: Scales based on viewport size.
 */

const props = defineProps({
  width: {
    type: Number,
    default: 200,
  },
  height: {
    type: Number,
    default: 200,
  },
  scale: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['animationComplete', 'stateChange', 'shotTriggered']);

// Canvas reference
const canvasRef = ref(null);
const ctx = ref(null);

// Responsive scaling
const { scaleValue, adaptiveScale, viewport } = useCanvasScaling();

// Animation controller
const {
  currentState,
  currentFrame,
  isPlaying,
  shotInProgress,
  currentSpriteSheet,
  frameDimensions,
  frameSourcePosition,
  start,
  stop,
  triggerShot: controllerTriggerShot,
} = useAnimationController();

// Sprite image cache
const spriteImages = ref({});
const imagesLoaded = ref(false);

// Canvas dimensions (responsive)
const canvasWidth = computed(() => {
  return Math.round(scaleValue(props.width) * props.scale);
});

const canvasHeight = computed(() => {
  return Math.round(scaleValue(props.height) * props.scale);
});

/**
 * Preload all sprite sheets
 */
async function preloadSprites() {
  const spriteSheets = [
    '/assets/character/character-idle.png',
    '/assets/character/character-variation.png',
    '/assets/character/character-hit-a0b803.png',
  ];

  const loadPromises = spriteSheets.map((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        spriteImages.value[src] = img;
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load sprite: ${src}`);
        reject(new Error(`Failed to load sprite: ${src}`));
      };
      img.src = src;
    });
  });

  try {
    await Promise.all(loadPromises);
    imagesLoaded.value = true;
    console.log('All sprites loaded successfully');
  } catch (error) {
    console.error('Error loading sprites:', error);
  }
}

/**
 * Initialize canvas context
 */
function initCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx.value = canvas.getContext('2d');

  // Enable crisp pixel rendering for sprite art
  ctx.value.imageSmoothingEnabled = false;
}

/**
 * Render current animation frame to canvas
 */
function render() {
  if (!ctx.value || !imagesLoaded.value) return;

  const canvas = canvasRef.value;
  if (!canvas) return;

  // Clear canvas
  ctx.value.clearRect(0, 0, canvas.width, canvas.height);

  // Get current sprite image
  const spriteSheet = spriteImages.value[currentSpriteSheet.value];
  if (!spriteSheet) {
    console.warn(`Sprite sheet not loaded: ${currentSpriteSheet.value}`);
    return;
  }

  // Get frame dimensions and position
  const dims = frameDimensions.value;
  const sourcePos = frameSourcePosition.value;

  // Calculate destination dimensions (scaled to canvas)
  const scaleX = canvas.width / dims.width;
  const scaleY = canvas.height / dims.height;
  const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

  const destWidth = dims.width * scale;
  const destHeight = dims.height * scale;

  // Center the sprite on canvas
  const destX = (canvas.width - destWidth) / 2;
  const destY = (canvas.height - destHeight) / 2;

  // Draw sprite frame
  ctx.value.drawImage(
    spriteSheet,
    sourcePos.x,
    sourcePos.y,
    dims.width,
    dims.height,
    destX,
    destY,
    destWidth,
    destHeight
  );
}

/**
 * Trigger shot animation
 */
function triggerShot() {
  const success = controllerTriggerShot();

  if (success) {
    emit('shotTriggered');
  }

  return success;
}

/**
 * Watch for frame changes and re-render
 */
watch([currentFrame, currentSpriteSheet], () => {
  render();
});

/**
 * Watch for state changes and emit events
 */
watch(currentState, (newState, oldState) => {
  emit('stateChange', { newState, oldState });

  // Emit animationComplete when returning to idle from cooldown
  if (oldState === 'cooldown' && newState === 'idle') {
    emit('animationComplete');
  }
});

// Initialize on mount
onMounted(async () => {
  initCanvas();
  await preloadSprites();

  // Start playing idle animation
  if (imagesLoaded.value) {
    start();
    render(); // Initial render
  }
});

// Cleanup on unmount
onUnmounted(() => {
  stop();
});

// Expose methods to parent
defineExpose({
  triggerShot,
  currentState,
  isPlaying,
  shotInProgress,
});
</script>

<style scoped lang="scss">
.character-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.character-canvas {
  /* Crisp pixel rendering for sprite art */
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;

  /* Prevent selection */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  /* Prevent touch callout on iOS */
  -webkit-touch-callout: none;
}
</style>
