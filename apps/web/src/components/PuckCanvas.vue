<template>
  <div class="puck-canvas-container">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      class="puck-canvas"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineExpose } from 'vue';
import { usePhysics } from '@/composables/usePhysics.js';
import { useCanvasScaling } from '@/composables/useCanvasScaling.js';
import { PUCK_CONFIG, VIEWPORT_CONFIG } from '@/config/animations.js';

const props = defineProps({
  width: {
    type: Number,
    default: VIEWPORT_CONFIG.baseCanvasDimensions.width,
  },
  height: {
    type: Number,
    default: VIEWPORT_CONFIG.baseCanvasDimensions.height,
  },
  showTrail: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['puckLaunched', 'puckLanded', 'puckMissed', 'positionUpdate']);

// Responsive scaling
const { scaleValue, scalePosition, scalePhysicsValue, adaptiveScale, viewport } =
  useCanvasScaling();

// Canvas setup (responsive dimensions - props are already scaled)
const canvasRef = ref(null);
const canvasWidth = computed(() => Math.round(props.width));
const canvasHeight = computed(() => Math.round(props.height));

// Physics
const {
  position,
  velocity,
  isFlying,
  launchPosition,
  isOutOfBounds,
  speed,
  launchPuck: physicsLaunch,
  updatePosition,
  stopPuck,
  resetPuck,
} = usePhysics();

// Sprite preloading
const puckSprites = ref({
  default: null,
  flying: null,
  small: null,
});
const spritesLoaded = ref(false);

// Animation control
const animationFrameId = ref(null);
const lastFrameTime = ref(0);

// Trail effect
const trailPositions = ref([]);
const maxTrailLength = 15; // Increased from 10 for longer trail

/**
 * Preload puck sprites
 */
async function preloadSprites() {
  const loadPromises = Object.entries(PUCK_CONFIG).map(([key, path]) => {
    if (key === 'dimensions') return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        puckSprites.value[key] = img;
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load puck sprite: ${path}`));
      img.src = path;
    });
  });

  try {
    await Promise.all(loadPromises);
    spritesLoaded.value = true;
    console.log('All puck sprites loaded successfully');
  } catch (error) {
    console.error('Error loading puck sprites:', error);
  }
}

/**
 * Get current puck sprite based on state
 */
function getCurrentSprite() {
  if (!spritesLoaded.value) return null;

  if (isFlying.value && speed.value > 400) {
    return puckSprites.value.flying;
  } else if (speed.value < 100) {
    return puckSprites.value.small;
  }
  return puckSprites.value.default;
}

/**
 * Get puck dimensions based on current sprite
 */
function getPuckDimensions() {
  if (isFlying.value && speed.value > 400) {
    return PUCK_CONFIG.dimensions.flying;
  } else if (speed.value < 100) {
    return PUCK_CONFIG.dimensions.small;
  }
  return PUCK_CONFIG.dimensions.default;
}

/**
 * Render puck on canvas
 */
function renderPuck(timestamp) {
  const canvas = canvasRef.value;
  if (!canvas || !spritesLoaded.value) return;

  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Render trail if enabled
  if (props.showTrail && trailPositions.value.length > 0) {
    ctx.globalAlpha = 0.5; // Increased from 0.3 for better visibility
    trailPositions.value.forEach((trailPos, index) => {
      const alpha = (index + 1) / trailPositions.value.length;
      ctx.globalAlpha = alpha * 0.5; // Increased from 0.3

      const trailSprite = puckSprites.value.small;
      const trailDims = PUCK_CONFIG.dimensions.small;
      // Trail size: slightly larger than small puck for visibility
      const baseRenderSize = Math.max(trailDims.width, trailDims.height) * 0.07;
      // Calculate scale based on actual canvas vs design canvas
      const scale = canvasWidth.value / VIEWPORT_CONFIG.baseCanvasDimensions.width;
      const renderSize = baseRenderSize * scale;

      if (trailSprite) {
        ctx.drawImage(
          trailSprite,
          trailPos.x - renderSize / 2,
          trailPos.y - renderSize / 2,
          renderSize,
          renderSize
        );
      }
    });
    ctx.globalAlpha = 1.0;
  }

  // Render main puck
  const sprite = getCurrentSprite();
  if (sprite) {
    const dims = getPuckDimensions();
    // Puck size varies by state:
    // - Flying (fast): 0.04 = ~28px from 712px sprite (smaller, fast-moving)
    // - Default (medium): 0.06 = ~43px from 712px sprite (normal size)
    // - Small (slow): 0.06 = ~10px from 168px sprite (smallest)
    let sizeMultiplier;
    if (isFlying.value && speed.value > 400) {
      sizeMultiplier = 0.04; // Smaller for flying puck
    } else if (speed.value < 100) {
      sizeMultiplier = 0.06; // Small sprite already makes it tiny
    } else {
      sizeMultiplier = 0.06; // Default size
    }

    const baseRenderSize = Math.max(dims.width, dims.height) * sizeMultiplier;
    // Calculate scale based on actual canvas vs design canvas
    const scale = canvasWidth.value / VIEWPORT_CONFIG.baseCanvasDimensions.width;
    const renderSize = baseRenderSize * scale;

    // Enable crisp rendering for pixel art
    ctx.imageSmoothingEnabled = false;

    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Draw puck centered on position
    ctx.drawImage(
      sprite,
      position.value.x - renderSize / 2,
      position.value.y - renderSize / 2,
      renderSize,
      renderSize
    );

    // Reset shadow for next frame
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

/**
 * Animation loop
 */
function animate(timestamp) {
  if (!isFlying.value) {
    // Reset trail when not flying
    trailPositions.value = [];
    renderPuck(timestamp);
    return;
  }

  // Update physics
  updatePosition(timestamp);

  // Add current position to trail
  if (props.showTrail) {
    trailPositions.value.push({ ...position.value });
    if (trailPositions.value.length > maxTrailLength) {
      trailPositions.value.shift();
    }
  }

  // Emit position update for collision detection
  emit('positionUpdate', {
    position: { ...position.value },
    velocity: { ...velocity.value },
    speed: speed.value,
  });

  // Render frame
  renderPuck(timestamp);

  // Check if puck stopped flying
  if (!isFlying.value) {
    if (isOutOfBounds.value) {
      emit('puckMissed');
      console.log('Puck missed - out of bounds');
    } else {
      emit('puckLanded');
      console.log('Puck landed');
    }
    return;
  }

  // Continue animation loop
  animationFrameId.value = requestAnimationFrame(animate);
}

/**
 * Start animation loop
 */
function startAnimation() {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  animationFrameId.value = requestAnimationFrame(animate);
}

/**
 * Stop animation loop
 */
function stopAnimation() {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
}

/**
 * Public method: Launch puck
 */
function launch(angle, power = 1.0, startPosition = null) {
  // Use default launch position if not provided (scaled for viewport)
  const launchPos = startPosition || {
    x: canvasWidth.value / 2,
    y: canvasHeight.value - (150 * (canvasHeight.value / VIEWPORT_CONFIG.baseCanvasDimensions.height)),
  };

  physicsLaunch(angle, power, launchPos);
  emit('puckLaunched', { angle, power, position: launchPos });
  startAnimation();
}

/**
 * Public method: Reset puck
 */
function reset(initialPosition = null) {
  stopAnimation();

  // Use scaled default position if not provided
  const resetPos = initialPosition || {
    x: canvasWidth.value / 2,
    y: canvasHeight.value - (150 * (canvasHeight.value / VIEWPORT_CONFIG.baseCanvasDimensions.height)),
  };

  resetPuck(resetPos);
  trailPositions.value = [];
  renderPuck(Date.now());
}

// Watch for flying state changes
watch(isFlying, (flying) => {
  if (flying) {
    startAnimation();
  } else {
    // Render final frame when stopped
    renderPuck(Date.now());
  }
});

// Lifecycle
onMounted(async () => {
  await preloadSprites();

  // Initialize puck at default position (scaled for viewport)
  resetPuck({
    x: canvasWidth.value / 2,
    y: canvasHeight.value - (150 * (canvasHeight.value / VIEWPORT_CONFIG.baseCanvasDimensions.height)),
  });

  // Render initial frame
  renderPuck(Date.now());
});

onUnmounted(() => {
  stopAnimation();
});

// Expose methods to parent
defineExpose({
  launch,
  reset,
  stopPuck,
});
</script>

<style scoped lang="scss">
.puck-canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3; // Above character (z: 2), below modal
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.puck-canvas {
  display: block;
  // Let canvas size match its internal resolution, no CSS scaling
}
</style>
