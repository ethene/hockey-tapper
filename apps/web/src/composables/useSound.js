/**
 * Sound Effects Composable for Hockey Tapper
 *
 * Manages HTML5 Audio API with audio pooling for overlapping sounds.
 * Supports volume control, muting, and preloading.
 *
 * Usage:
 * const { playSound, preloadSounds, toggleMute, setVolume } = useSound()
 *
 * await preloadSounds()
 * playSound('shoot')
 */

import { ref, readonly } from 'vue'

// Audio pool size (allows N simultaneous instances of same sound)
const POOL_SIZE = 3

// Sound configuration
const SOUND_CONFIG = {
  shoot: {
    path: '/assets/sounds/shoot.mp3',
    volume: 0.6,
  },
  goal: {
    path: '/assets/sounds/goal.mp3',
    volume: 0.7,
  },
  miss: {
    path: '/assets/sounds/miss.mp3',
    volume: 0.5,
  },
  combo: {
    path: '/assets/sounds/combo.mp3',
    volume: 0.8,
  },
  tick: {
    path: '/assets/sounds/tick.mp3',
    volume: 0.4,
  },
}

// Global state (shared across all composable instances)
const audioPool = {}
const isMuted = ref(false)
const masterVolume = ref(1.0)
const isPreloaded = ref(false)
const preloadError = ref(null)

/**
 * Initialize audio pool for a sound
 */
const createAudioPool = (soundKey, config) => {
  const pool = []

  for (let i = 0; i < POOL_SIZE; i++) {
    const audio = new Audio(config.path)
    audio.volume = config.volume * masterVolume.value
    audio.preload = 'auto'

    // Reset audio when it ends (make it available for reuse)
    audio.addEventListener('ended', () => {
      audio.currentTime = 0
    })

    pool.push(audio)
  }

  return pool
}

/**
 * Get next available audio instance from pool
 */
const getAvailableAudio = (soundKey) => {
  const pool = audioPool[soundKey]
  if (!pool) return null

  // Find first non-playing audio
  const available = pool.find(audio => audio.paused || audio.ended)

  // If all are playing, use the oldest one (first in pool)
  return available || pool[0]
}

/**
 * Preload all sounds
 */
const preloadSounds = async () => {
  if (isPreloaded.value) {
    console.log('[useSound] Sounds already preloaded')
    return
  }

  console.log('[useSound] Preloading sounds...')
  preloadError.value = null

  try {
    // Create audio pools for all sounds
    Object.keys(SOUND_CONFIG).forEach(soundKey => {
      audioPool[soundKey] = createAudioPool(soundKey, SOUND_CONFIG[soundKey])
    })

    // Wait for all audio files to be loaded
    const loadPromises = Object.values(audioPool)
      .flat()
      .map(audio => {
        return new Promise((resolve, reject) => {
          if (audio.readyState >= 2) {
            // Already loaded
            resolve()
          } else {
            audio.addEventListener('canplaythrough', resolve, { once: true })
            audio.addEventListener('error', reject, { once: true })
            audio.load()
          }
        })
      })

    await Promise.all(loadPromises)

    isPreloaded.value = true
    console.log('[useSound] All sounds preloaded successfully')
  } catch (error) {
    preloadError.value = `Failed to preload sounds: ${error.message}`
    console.error('[useSound] Preload error:', error)
    throw error
  }
}

/**
 * Play a sound
 */
const playSound = (soundKey) => {
  // Validate sound key
  if (!SOUND_CONFIG[soundKey]) {
    console.warn(`[useSound] Unknown sound: ${soundKey}`)
    return
  }

  // Don't play if muted
  if (isMuted.value) {
    console.log(`[useSound] Sound muted: ${soundKey}`)
    return
  }

  // Get available audio instance
  const audio = getAvailableAudio(soundKey)

  if (!audio) {
    console.warn(`[useSound] No audio pool for sound: ${soundKey}`)
    return
  }

  // Reset and play
  audio.currentTime = 0

  // Play with promise handling (browsers may block autoplay)
  const playPromise = audio.play()

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log(`[useSound] Playing: ${soundKey}`)
      })
      .catch(error => {
        console.warn(`[useSound] Play blocked: ${soundKey}`, error)
      })
  }
}

/**
 * Stop all instances of a sound
 */
const stopSound = (soundKey) => {
  const pool = audioPool[soundKey]
  if (!pool) return

  pool.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })

  console.log(`[useSound] Stopped: ${soundKey}`)
}

/**
 * Stop all sounds
 */
const stopAllSounds = () => {
  Object.keys(audioPool).forEach(soundKey => {
    stopSound(soundKey)
  })

  console.log('[useSound] All sounds stopped')
}

/**
 * Toggle mute state
 */
const toggleMute = () => {
  isMuted.value = !isMuted.value

  if (isMuted.value) {
    stopAllSounds()
  }

  console.log(`[useSound] Muted: ${isMuted.value}`)

  return isMuted.value
}

/**
 * Set master volume (0.0 - 1.0)
 */
const setVolume = (volume) => {
  // Clamp between 0 and 1
  masterVolume.value = Math.max(0, Math.min(1, volume))

  // Update all audio instances
  Object.keys(audioPool).forEach(soundKey => {
    const config = SOUND_CONFIG[soundKey]
    const pool = audioPool[soundKey]

    pool.forEach(audio => {
      audio.volume = config.volume * masterVolume.value
    })
  })

  console.log(`[useSound] Volume set to: ${masterVolume.value}`)
}

/**
 * Get current volume
 */
const getVolume = () => {
  return masterVolume.value
}

/**
 * Check if muted
 */
const getMuted = () => {
  return isMuted.value
}

/**
 * Composable export
 */
export const useSound = () => {
  return {
    // Methods
    preloadSounds,
    playSound,
    stopSound,
    stopAllSounds,
    toggleMute,
    setVolume,
    getVolume,
    getMuted,

    // Readonly state
    isMuted: readonly(isMuted),
    masterVolume: readonly(masterVolume),
    isPreloaded: readonly(isPreloaded),
    preloadError: readonly(preloadError),

    // Available sounds
    availableSounds: Object.keys(SOUND_CONFIG),
  }
}

export default useSound
