<template>
  <canvas
    ref="canvasRef"
    class="particle-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useParticles } from '../composables/useParticles.js'

// Props
const props = defineProps({
  width: {
    type: Number,
    default: 430, // Mobile frame width
  },
  height: {
    type: Number,
    default: 932, // Mobile frame height
  },
})

// Canvas setup
const canvasRef = ref(null)
const canvasWidth = ref(props.width)
const canvasHeight = ref(props.height)

// Watch for prop changes to update canvas size
watch(() => props.width, (newWidth) => {
  canvasWidth.value = newWidth
  console.log('[ParticleCanvas] Width updated:', newWidth)
})

watch(() => props.height, (newHeight) => {
  canvasHeight.value = newHeight
  console.log('[ParticleCanvas] Height updated:', newHeight)
})

// Particle system
const { particles, updateParticles, getParticleOpacity } = useParticles()

// Animation state
let animationFrameId = null
let lastFrameTime = 0
let ctx = null

/**
 * Initialize canvas context
 */
const initCanvas = () => {
  if (!canvasRef.value) return

  ctx = canvasRef.value.getContext('2d')
  if (!ctx) {
    console.error('[ParticleCanvas] Failed to get 2D context')
    return
  }

  console.log('[ParticleCanvas] Canvas initialized:', canvasWidth.value, 'x', canvasHeight.value)
}

/**
 * Render single particle
 */
const renderParticle = (particle) => {
  if (!ctx) return

  const opacity = getParticleOpacity(particle)
  if (opacity <= 0) return

  ctx.save()

  // Set particle color and opacity
  ctx.globalAlpha = opacity
  ctx.fillStyle = particle.color

  // Draw circle
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * Main render loop
 */
const render = (timestamp) => {
  if (!ctx) return

  // Calculate delta time
  const deltaTime = lastFrameTime === 0 ? 0 : (timestamp - lastFrameTime) / 1000
  lastFrameTime = timestamp

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // Update particle physics
  if (deltaTime > 0) {
    updateParticles(deltaTime)
  }

  // Render all active particles
  particles.value.forEach(particle => {
    renderParticle(particle)
  })

  // Continue animation loop
  animationFrameId = requestAnimationFrame(render)
}

/**
 * Start animation loop
 */
const startAnimation = () => {
  if (animationFrameId) return

  lastFrameTime = 0
  animationFrameId = requestAnimationFrame(render)
  console.log('[ParticleCanvas] Animation loop started')
}

/**
 * Stop animation loop
 */
const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    console.log('[ParticleCanvas] Animation loop stopped')
  }
}

/**
 * Handle canvas resize
 */
const handleResize = () => {
  canvasWidth.value = props.width
  canvasHeight.value = props.height

  if (canvasRef.value) {
    canvasRef.value.width = canvasWidth.value
    canvasRef.value.height = canvasHeight.value
  }
}

// Watch for prop changes
watch(() => [props.width, props.height], handleResize)

// Lifecycle hooks
onMounted(() => {
  initCanvas()
  startAnimation()
})

onBeforeUnmount(() => {
  stopAnimation()
})

// Expose methods to parent (optional)
defineExpose({
  startAnimation,
  stopAnimation,
})
</script>

<style scoped lang="scss">
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // Allow clicks to pass through
  z-index: 4; // Above puck (3), below feedback (5)
}
</style>
