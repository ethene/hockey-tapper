/**
 * Animation Controller Composable
 *
 * Manages character animation state machine with transitions:
 * idle → windup → hit → cooldown → idle
 *
 * Features:
 * - State-based animation control
 * - Frame progression with configurable FPS
 * - Automatic state transitions
 * - Event callbacks for state changes
 */

import { ref, computed, onUnmounted } from 'vue';
import { ANIMATION_CONFIG } from '@/config/animations.js';

export function useAnimationController() {
  // Current animation state
  const currentState = ref(ANIMATION_CONFIG.initialState);

  // Current frame index within the animation
  const currentFrame = ref(0);

  // Animation loop control
  const animationFrameId = ref(null);
  const lastFrameTime = ref(0);
  const isPlaying = ref(false);

  // Track if shot is in progress (prevents spam)
  const shotInProgress = ref(false);

  /**
   * Get current animation configuration
   */
  const currentAnimation = computed(() => {
    return ANIMATION_CONFIG.states[currentState.value];
  });

  /**
   * Calculate time per frame based on FPS
   */
  const frameInterval = computed(() => {
    return 1000 / currentAnimation.value.fps; // milliseconds per frame
  });

  /**
   * Check if current animation should loop
   */
  const shouldLoop = computed(() => {
    return currentAnimation.value.loop;
  });

  /**
   * Calculate total frames for current animation
   */
  const totalFrames = computed(() => {
    return currentAnimation.value.frames;
  });

  /**
   * Update animation frame based on time elapsed
   */
  function updateAnimation(timestamp) {
    if (!isPlaying.value) return;

    // Initialize on first frame
    if (lastFrameTime.value === 0) {
      lastFrameTime.value = timestamp;
    }

    const elapsed = timestamp - lastFrameTime.value;

    // For single-frame animations with duration, use duration instead of FPS
    if (totalFrames.value === 1 && currentAnimation.value.duration) {
      if (elapsed >= currentAnimation.value.duration && !shouldLoop.value) {
        // Duration complete, transition to next state
        transitionToNextState();
        // After transition, continue animation loop with new state
        animationFrameId.value = requestAnimationFrame(updateAnimation);
        return;
      }
    } else {
      // Multi-frame animation: Check if enough time has passed for next frame
      if (elapsed >= frameInterval.value) {
        lastFrameTime.value = timestamp;

        // Advance to next frame
        currentFrame.value++;

        // Handle frame overflow
        if (currentFrame.value >= totalFrames.value) {
          if (shouldLoop.value) {
            // Loop back to first frame
            currentFrame.value = 0;
          } else {
            // Animation complete, transition to next state
            currentFrame.value = totalFrames.value - 1; // Stay on last frame
            transitionToNextState();
            return;
          }
        }
      }
    }

    // Continue animation loop
    animationFrameId.value = requestAnimationFrame(updateAnimation);
  }

  /**
   * Transition to the next state based on current state
   */
  function transitionToNextState() {
    const validTransitions = ANIMATION_CONFIG.transitions[currentState.value];

    if (!validTransitions || validTransitions.length === 0) {
      // No valid transitions, stay in current state
      return;
    }

    // Get next state (first valid transition)
    const nextState = validTransitions[0];

    // Special handling for cooldown → idle transition
    if (currentState.value === 'cooldown' && nextState === 'idle') {
      shotInProgress.value = false;
    }

    // Transition to next state
    changeState(nextState);
  }

  /**
   * Change animation state
   */
  function changeState(newState) {
    if (!ANIMATION_CONFIG.states[newState]) {
      console.error(`Invalid animation state: ${newState}`);
      return;
    }

    currentState.value = newState;
    currentFrame.value = 0;
    lastFrameTime.value = 0;

    // If new state is a looping animation, ensure playback continues
    if (ANIMATION_CONFIG.states[newState].loop) {
      if (!isPlaying.value) {
        start();
      }
    }
  }

  /**
   * Start animation playback
   */
  function start() {
    if (isPlaying.value) return;

    isPlaying.value = true;
    lastFrameTime.value = 0;
    animationFrameId.value = requestAnimationFrame(updateAnimation);
  }

  /**
   * Stop animation playback
   */
  function stop() {
    isPlaying.value = false;

    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  }

  /**
   * Reset animation to initial state
   */
  function reset() {
    stop();
    currentState.value = ANIMATION_CONFIG.initialState;
    currentFrame.value = 0;
    lastFrameTime.value = 0;
    shotInProgress.value = false;
  }

  /**
   * Trigger shot animation sequence
   * idle → windup → hit → cooldown → idle
   */
  function triggerShot() {
    // Prevent shot if already in progress
    if (shotInProgress.value) {
      console.log('Shot already in progress, ignoring trigger');
      return false;
    }

    // Can only trigger shot from idle state
    if (currentState.value !== 'idle') {
      console.log('Can only trigger shot from idle state');
      return false;
    }

    shotInProgress.value = true;
    changeState('windup');
    return true;
  }

  /**
   * Get current sprite sheet path
   */
  const currentSpriteSheet = computed(() => {
    return currentAnimation.value.spriteSheet;
  });

  /**
   * Get current frame dimensions
   */
  const frameDimensions = computed(() => {
    return {
      width: currentAnimation.value.dimensions.frameWidth,
      height: currentAnimation.value.dimensions.frameHeight,
      totalWidth: currentAnimation.value.dimensions.width,
      totalHeight: currentAnimation.value.dimensions.height,
    };
  });

  /**
   * Calculate source position in sprite sheet for current frame
   * (for multi-frame sprite sheets)
   */
  const frameSourcePosition = computed(() => {
    const dims = frameDimensions.value;
    const framesPerRow = Math.floor(dims.totalWidth / dims.width);

    const row = Math.floor(currentFrame.value / framesPerRow);
    const col = currentFrame.value % framesPerRow;

    return {
      x: col * dims.width,
      y: row * dims.height,
    };
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stop();
  });

  return {
    // State
    currentState,
    currentFrame,
    isPlaying,
    shotInProgress,

    // Computed
    currentAnimation,
    currentSpriteSheet,
    frameDimensions,
    frameSourcePosition,

    // Methods
    start,
    stop,
    reset,
    triggerShot,
    changeState,
  };
}
