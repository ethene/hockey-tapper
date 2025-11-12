/**
 * Particle Effects Composable for Hockey Tapper
 *
 * Manages particle physics simulation for visual feedback on goals and combos.
 * Uses object pooling for performance optimization.
 *
 * Usage:
 * const { particles, spawnParticles, updateParticles, clearParticles } = useParticles()
 *
 * spawnParticles({ x: 100, y: 200, type: 'goal' })
 */

import { ref, readonly } from 'vue'

// Particle pool size (reuse particles instead of creating new ones)
const PARTICLE_POOL_SIZE = 200

// Particle type configurations
const PARTICLE_TYPES = {
  goal: {
    count: 20,
    colors: ['#81A7F1', '#FB393A', '#FFFFFF', '#FFD700'],
    size: { min: 3, max: 8 },
    velocity: { min: 100, max: 300 },
    lifetime: { min: 0.5, max: 1.5 },
    gravity: 400,
    spread: 360, // degrees
  },
  combo: {
    count: 30,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF'],
    size: { min: 4, max: 12 },
    velocity: { min: 150, max: 400 },
    lifetime: { min: 0.8, max: 2.0 },
    gravity: 300,
    spread: 360,
  },
  miss: {
    count: 10,
    colors: ['#808080', '#A0A0A0', '#606060'],
    size: { min: 2, max: 5 },
    velocity: { min: 50, max: 150 },
    lifetime: { min: 0.3, max: 0.8 },
    gravity: 500,
    spread: 180,
  },
}

// Active particles array (global state shared across instances)
const activeParticles = ref([])

// Particle pool (reusable particle objects)
const particlePool = []

/**
 * Initialize particle pool
 */
const initializePool = () => {
  if (particlePool.length > 0) return

  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    particlePool.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 5,
      color: '#FFFFFF',
      lifetime: 1.0,
      age: 0,
      active: false,
    })
  }
}

/**
 * Get available particle from pool
 */
const getParticleFromPool = () => {
  const particle = particlePool.find(p => !p.active)
  if (particle) {
    particle.active = true
    particle.age = 0
    return particle
  }
  return null
}

/**
 * Return particle to pool
 */
const returnParticleToPool = (particle) => {
  particle.active = false
}

/**
 * Random number between min and max
 */
const random = (min, max) => {
  return min + Math.random() * (max - min)
}

/**
 * Random element from array
 */
const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Spawn particles at position
 *
 * @param {Object} options - Spawn options
 * @param {number} options.x - X position
 * @param {number} options.y - Y position
 * @param {string} options.type - Particle type ('goal', 'combo', 'miss')
 * @param {number} [options.count] - Override particle count
 */
const spawnParticles = ({ x, y, type = 'goal', count }) => {
  initializePool()

  const config = PARTICLE_TYPES[type]
  if (!config) {
    console.warn(`[useParticles] Unknown particle type: ${type}`)
    return
  }

  const particleCount = count ?? config.count
  const newParticles = []

  for (let i = 0; i < particleCount; i++) {
    const particle = getParticleFromPool()
    if (!particle) {
      console.warn('[useParticles] Particle pool exhausted')
      break
    }

    // Random angle within spread
    const spreadRadians = (config.spread * Math.PI) / 180
    const angle = Math.random() * spreadRadians - spreadRadians / 2 - Math.PI / 2 // -90deg is up

    // Random velocity
    const speed = random(config.velocity.min, config.velocity.max)

    // Initialize particle
    particle.x = x
    particle.y = y
    particle.vx = Math.cos(angle) * speed
    particle.vy = Math.sin(angle) * speed
    particle.size = random(config.size.min, config.size.max)
    particle.color = randomElement(config.colors)
    particle.lifetime = random(config.lifetime.min, config.lifetime.max)
    particle.age = 0
    particle.gravity = config.gravity

    newParticles.push(particle)
  }

  activeParticles.value.push(...newParticles)
  console.log(`[useParticles] Spawned ${newParticles.length} ${type} particles at (${x}, ${y})`)
}

/**
 * Update all active particles
 *
 * @param {number} deltaTime - Time since last frame (seconds)
 */
const updateParticles = (deltaTime) => {
  const particlesToRemove = []

  activeParticles.value.forEach((particle, index) => {
    // Update age
    particle.age += deltaTime

    // Remove if expired
    if (particle.age >= particle.lifetime) {
      particlesToRemove.push(index)
      return
    }

    // Apply gravity
    particle.vy += particle.gravity * deltaTime

    // Apply velocity
    particle.x += particle.vx * deltaTime
    particle.y += particle.vy * deltaTime

    // Apply air resistance
    particle.vx *= 0.99
    particle.vy *= 0.99
  })

  // Remove expired particles (reverse order to avoid index issues)
  for (let i = particlesToRemove.length - 1; i >= 0; i--) {
    const index = particlesToRemove[i]
    const particle = activeParticles.value[index]
    returnParticleToPool(particle)
    activeParticles.value.splice(index, 1)
  }
}

/**
 * Clear all active particles
 */
const clearParticles = () => {
  activeParticles.value.forEach(particle => {
    returnParticleToPool(particle)
  })
  activeParticles.value = []
  console.log('[useParticles] All particles cleared')
}

/**
 * Get particle opacity based on age/lifetime
 *
 * @param {Object} particle - Particle object
 * @returns {number} Opacity (0-1)
 */
const getParticleOpacity = (particle) => {
  const progress = particle.age / particle.lifetime
  // Fade out in last 30% of lifetime
  if (progress > 0.7) {
    return 1 - (progress - 0.7) / 0.3
  }
  return 1
}

/**
 * Composable export
 */
export const useParticles = () => {
  return {
    // State (readonly)
    particles: readonly(activeParticles),

    // Methods
    spawnParticles,
    updateParticles,
    clearParticles,
    getParticleOpacity,

    // Constants
    PARTICLE_TYPES: Object.keys(PARTICLE_TYPES),
  }
}

export default useParticles
