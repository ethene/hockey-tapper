/**
 * Animation Configuration for Hockey Tapper
 *
 * Defines animation states, sprite paths, frame data, and timing
 * for the character animation system.
 */

export const ANIMATION_CONFIG = {
  // Base path for character sprites
  basePath: '/assets/character',

  // Animation states
  states: {
    // Idle animation - looping, waiting for user input
    idle: {
      spriteSheet: '/assets/character/character-idle.png',
      frames: 1, // Single frame for now (can expand with multi-frame sprite sheet)
      fps: 8,
      loop: true,
      dimensions: {
        width: 1024,
        height: 1024,
        frameWidth: 1024,
        frameHeight: 1024,
      },
    },

    // Windup animation - pre-shot preparation
    windup: {
      spriteSheet: '/assets/character/character-variation.png',
      frames: 1,
      fps: 12,
      loop: false,
      dimensions: {
        width: 1024,
        height: 1024,
        frameWidth: 1024,
        frameHeight: 1024,
      },
      duration: 200, // milliseconds
    },

    // Hit animation - shot execution
    hit: {
      spriteSheet: '/assets/character/character-hit-a0b803.png',
      frames: 1,
      fps: 16,
      loop: false,
      dimensions: {
        width: 883,
        height: 1024,
        frameWidth: 883,
        frameHeight: 1024,
      },
      duration: 150, // milliseconds
    },

    // Cooldown animation - return to idle
    cooldown: {
      spriteSheet: '/assets/character/character-variation.png',
      frames: 1,
      fps: 10,
      loop: false,
      dimensions: {
        width: 1024,
        height: 1024,
        frameWidth: 1024,
        frameHeight: 1024,
      },
      duration: 300, // milliseconds
    },
  },

  // State transition rules
  transitions: {
    idle: ['windup'],
    windup: ['hit'],
    hit: ['cooldown'],
    cooldown: ['idle'],
  },

  // Default state
  initialState: 'idle',
};

/**
 * Puck asset configuration
 */
export const PUCK_CONFIG = {
  default: '/assets/puck/puck-default.png',
  flying: '/assets/puck/puck-flying.png',
  small: '/assets/puck/puck-small.png',
  dimensions: {
    default: { width: 712, height: 712 },
    flying: { width: 712, height: 712 },
    small: { width: 168, height: 168 },
  },
};

/**
 * Target zone configuration - RELATIVE POSITIONING
 * All positions are PERCENTAGES of container (not pixels!)
 * Container is mobile-frame capped at 375px width
 * Targets positioned symmetrically around center (50%)
 *
 * Position format: { x: %, y: % } where % is 0-100
 * Component will convert to pixels based on actual container size
 */
export const TARGET_CONFIG = {
  zones: [
    {
      id: 'top',
      sprite: '/assets/targets/target-top.png',
      points: 200,
      position: { x: 50, y: 0 }, // Center top (50% horizontal, at the very top - moved 10% higher)
      dimensions: { width: 50, height: 50 }, // Reduced from 60x60
      accuracyBonusMax: 50,
    },
    {
      id: 'middle-left',
      sprite: '/assets/targets/target-middle.png',
      points: 100,
      position: { x: 22, y: 31.5 }, // Left side (28% left of center)
      dimensions: { width: 50, height: 50 }, // Reduced from 60x60
      accuracyBonusMax: 30,
    },
    {
      id: 'middle-right',
      sprite: '/assets/targets/target-middle.png',
      points: 100,
      position: { x: 78, y: 31.5 }, // Right side (28% right of center, symmetric!)
      dimensions: { width: 50, height: 50 }, // Reduced from 60x60
      accuracyBonusMax: 30,
    },
    {
      id: 'bottom-left',
      sprite: '/assets/targets/target-bottom-left.png',
      points: 50,
      position: { x: 30, y: 60 }, // Bottom-left (20% left of center - more spacing!)
      dimensions: { width: 50, height: 50 }, // Reduced from 60x60
      accuracyBonusMax: 10,
    },
    {
      id: 'bottom-right',
      sprite: '/assets/targets/target-bottom-right.png',
      points: 50,
      position: { x: 70, y: 60 }, // Bottom-right (20% right of center, symmetric!)
      dimensions: { width: 50, height: 50 }, // Reduced from 60x60
      accuracyBonusMax: 10,
    },
  ],
};

/**
 * Visual feedback configuration
 * (Goal!/Miss! text will be rendered with CSS)
 */
export const FEEDBACK_CONFIG = {
  goal: {
    text: 'Goal!',
    color: '#81A7F1', // Blue from Figma
    fontSize: 24,
    fontWeight: 700,
    duration: 1500, // milliseconds
    animationType: 'popup', // 'popup' | 'slide' | 'fade'
  },
  miss: {
    text: 'Miss!',
    color: '#81A7F1',
    fontSize: 24,
    fontWeight: 700,
    duration: 1500,
    animationType: 'shake',
  },
  score: {
    // +100, +150, etc.
    color: '#81A7F1',
    fontSize: 24,
    fontWeight: 700,
    duration: 1200,
    animationType: 'slideUp',
    fadeOutDuration: 300,
  },
  combo: {
    text: 'Combo!',
    color: '#FFD700', // Gold
    fontSize: 28,
    fontWeight: 700,
    duration: 1800,
    animationType: 'popup',
  },
};

/**
 * Stadium/background configuration
 */
export const BACKGROUND_CONFIG = {
  stadium: '/assets/stadium-bg.png',
  dimensions: { width: 375, height: 694 },
  scoreIndicator: '/assets/score-indicator-7f1d75.png',
};

/**
 * Physics constants for shot mechanics
 * Targets are ABOVE the player, so angle needs to be steep (70-85°)
 * Need VERY high velocity to reach top target at y=100 from launch at y=410
 */
export const PHYSICS_CONFIG = {
  gravity: 180, // pixels/second² (reduced further for longer flight)
  friction: 0.998, // velocity decay per frame (almost no friction)
  baseVelocity: 1800, // pixels/second (MUCH higher for long trajectory)
  maxVelocity: 2200, // max shot power (very high for top targets)
  shotAngle: 78, // degrees (steep angle - targets are way above player!)
  cooldownDuration: 1500, // milliseconds between shots
};

/**
 * Responsive design breakpoints
 */
export const VIEWPORT_CONFIG = {
  breakpoints: {
    compact: { min: 320, max: 374 },
    mobile: { min: 375, max: 767 },
    tablet: { min: 768, max: 1023 },
    desktop: { min: 1024, max: Infinity },
  },
  baseCanvasDimensions: {
    width: 375,
    height: 812,
  },
};

/**
 * Performance settings
 */
export const PERFORMANCE_CONFIG = {
  targetFPS: 60,
  maxMemoryMB: 50,
  preloadAssets: true,
  enableParticles: true, // Can be toggled based on device performance
};

export default {
  ANIMATION_CONFIG,
  PUCK_CONFIG,
  TARGET_CONFIG,
  FEEDBACK_CONFIG,
  BACKGROUND_CONFIG,
  PHYSICS_CONFIG,
  VIEWPORT_CONFIG,
  PERFORMANCE_CONFIG,
};
