/**
 * Physics Composable
 *
 * Simulates puck physics with gravity, velocity, and trajectory calculations.
 *
 * Features:
 * - Velocity-based movement with x/y components
 * - Gravity acceleration (downward force)
 * - Friction/air resistance
 * - Trajectory calculation from launch angle
 * - Collision detection boundaries
 * - Flight state management
 */

import { ref, computed } from 'vue';
import { PHYSICS_CONFIG, VIEWPORT_CONFIG } from '@/config/animations.js';

export function usePhysics() {
  // Puck position (pixels from top-left)
  const position = ref({ x: 0, y: 0 });

  // Puck velocity (pixels per second)
  const velocity = ref({ x: 0, y: 0 });

  // Flight state
  const isFlying = ref(false);

  // Time tracking for physics calculations
  const lastUpdateTime = ref(0);

  // Initial launch position (where puck starts)
  const launchPosition = ref({ x: 0, y: 0 });

  /**
   * Calculate if puck is out of bounds
   */
  const isOutOfBounds = computed(() => {
    const { width, height } = VIEWPORT_CONFIG.baseCanvasDimensions;
    return (
      position.value.x < -100 ||
      position.value.x > width + 100 ||
      position.value.y < -100 ||
      position.value.y > height + 100
    );
  });

  /**
   * Launch puck with specified angle and power
   * @param {number} angle - Launch angle in degrees (0 = right, 90 = up)
   * @param {number} power - Shot power (0-1 multiplier on baseVelocity)
   * @param {object} startPosition - Starting position {x, y}
   */
  function launchPuck(angle = PHYSICS_CONFIG.shotAngle, power = 1.0, startPosition = null) {
    // Set starting position
    if (startPosition) {
      launchPosition.value = { ...startPosition };
      position.value = { ...startPosition };
    }

    // Calculate velocity components from angle and power
    const angleRad = (angle * Math.PI) / 180;
    const totalVelocity = Math.min(
      PHYSICS_CONFIG.baseVelocity * power,
      PHYSICS_CONFIG.maxVelocity
    );

    velocity.value = {
      x: Math.cos(angleRad) * totalVelocity,
      y: -Math.sin(angleRad) * totalVelocity, // Negative because y increases downward
    };

    isFlying.value = true;
    lastUpdateTime.value = 0;

    console.log(
      `Puck launched: angle=${angle}°, power=${power.toFixed(2)}, velocity=(${velocity.value.x.toFixed(1)}, ${velocity.value.y.toFixed(1)})`
    );
  }

  /**
   * Update puck position and velocity based on physics
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  function updatePosition(timestamp) {
    if (!isFlying.value) return;

    // Initialize time on first update
    if (lastUpdateTime.value === 0) {
      lastUpdateTime.value = timestamp;
      return;
    }

    // Calculate delta time in seconds
    const deltaTime = (timestamp - lastUpdateTime.value) / 1000;
    lastUpdateTime.value = timestamp;

    // Limit delta time to prevent huge jumps (max 50ms)
    const dt = Math.min(deltaTime, 0.05);

    // Apply gravity to y velocity (downward acceleration)
    velocity.value.y += PHYSICS_CONFIG.gravity * dt;

    // Apply friction to both velocity components (air resistance)
    velocity.value.x *= PHYSICS_CONFIG.friction;
    velocity.value.y *= PHYSICS_CONFIG.friction;

    // Update position based on velocity
    position.value.x += velocity.value.x * dt;
    position.value.y += velocity.value.y * dt;

    // Check if puck is out of bounds
    if (isOutOfBounds.value) {
      stopPuck();
      console.log('Puck out of bounds - stopping');
    }
  }

  /**
   * Stop puck movement
   */
  function stopPuck() {
    isFlying.value = false;
    velocity.value = { x: 0, y: 0 };
    lastUpdateTime.value = 0;
  }

  /**
   * Reset puck to initial position
   * @param {object} initialPosition - Optional starting position
   */
  function resetPuck(initialPosition = null) {
    stopPuck();
    if (initialPosition) {
      position.value = { ...initialPosition };
      launchPosition.value = { ...initialPosition };
    } else {
      // Default to center-bottom of viewport
      const { width, height } = VIEWPORT_CONFIG.baseCanvasDimensions;
      position.value = { x: width / 2, y: height - 150 };
      launchPosition.value = { ...position.value };
    }
  }

  /**
   * Calculate trajectory path for visualization
   * @param {number} steps - Number of points in trajectory
   * @returns {Array<{x: number, y: number}>} - Array of position points
   */
  function calculateTrajectory(steps = 20) {
    const trajectory = [];
    const dt = 0.05; // 50ms steps

    let simX = position.value.x;
    let simY = position.value.y;
    let simVelX = velocity.value.x;
    let simVelY = velocity.value.y;

    for (let i = 0; i < steps; i++) {
      trajectory.push({ x: simX, y: simY });

      // Simulate physics for next point
      simVelY += PHYSICS_CONFIG.gravity * dt;
      simVelX *= PHYSICS_CONFIG.friction;
      simVelY *= PHYSICS_CONFIG.friction;
      simX += simVelX * dt;
      simY += simVelY * dt;

      // Stop if out of bounds
      const { width, height } = VIEWPORT_CONFIG.baseCanvasDimensions;
      if (simX < -100 || simX > width + 100 || simY < -100 || simY > height + 100) {
        break;
      }
    }

    return trajectory;
  }

  /**
   * Get current speed (magnitude of velocity vector)
   */
  const speed = computed(() => {
    return Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2);
  });

  /**
   * Get current direction angle in degrees
   */
  const direction = computed(() => {
    const angle = Math.atan2(-velocity.value.y, velocity.value.x) * (180 / Math.PI);
    return angle;
  });

  /**
   * Check if puck is moving (has velocity)
   */
  const isMoving = computed(() => {
    return speed.value > 10; // Threshold to prevent jitter at low speeds
  });

  return {
    // State
    position,
    velocity,
    isFlying,
    launchPosition,

    // Computed
    isOutOfBounds,
    speed,
    direction,
    isMoving,

    // Methods
    launchPuck,
    updatePosition,
    stopPuck,
    resetPuck,
    calculateTrajectory,
  };
}
