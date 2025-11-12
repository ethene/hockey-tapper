<template>
  <div class="target-zones">
    <div
      v-for="zone in zones"
      :key="zone.id"
      class="target-zone"
      :class="{ 'target-hit': zone.isHit }"
      :style="getZoneStyle(zone)"
    >
      <!-- Render target sprite -->
      <img
        :src="zone.sprite"
        :alt="`${zone.id} target`"
        class="target-sprite"
      />

      <!-- Points label -->
      <div class="target-points">{{ zone.points }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { TARGET_CONFIG } from '@/config/animations.js';
import { useCanvasScaling } from '@/composables/useCanvasScaling.js';

const emit = defineEmits(['targetHit', 'targetMissed']);

// Responsive scaling
const { scaleValue, scalePosition, scaleDimensions } = useCanvasScaling();

// Target zones with hit tracking and scaled positions
const zones = ref(
  TARGET_CONFIG.zones.map((zone) => ({
    ...zone,
    isHit: false,
    hitTimestamp: null,
  }))
);

// Hit animation duration (ms)
const HIT_ANIMATION_DURATION = 300;

/**
 * Calculate zone style (position and dimensions) - responsive
 */
function getZoneStyle(zone) {
  const scaledPosition = scalePosition(zone.position);
  const scaledDimensions = scaleDimensions(zone.dimensions);

  return {
    left: `${scaledPosition.x}px`,
    top: `${scaledPosition.y}px`,
    width: `${scaledDimensions.width}px`,
    height: `${scaledDimensions.height}px`,
  };
}

/**
 * Check if puck position intersects with target zone
 * @param {object} puckPos - Puck position {x, y}
 * @param {number} puckRadius - Puck collision radius
 * @param {object} zone - Target zone
 * @returns {boolean} - True if collision detected
 */
function checkCollision(puckPos, puckRadius, zone) {
  // Calculate scaled zone bounds
  const scaledPosition = scalePosition(zone.position);
  const scaledDimensions = scaleDimensions(zone.dimensions);

  const zoneBounds = {
    left: scaledPosition.x,
    right: scaledPosition.x + scaledDimensions.width,
    top: scaledPosition.y,
    bottom: scaledPosition.y + scaledDimensions.height,
  };

  // Circle-rectangle collision detection
  // Find closest point on rectangle to circle center
  const closestX = Math.max(zoneBounds.left, Math.min(puckPos.x, zoneBounds.right));
  const closestY = Math.max(zoneBounds.top, Math.min(puckPos.y, zoneBounds.bottom));

  // Calculate distance from circle center to closest point
  const distanceX = puckPos.x - closestX;
  const distanceY = puckPos.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Check if distance is less than radius (also scale the radius)
  const scaledRadius = scaleValue(puckRadius);
  return distanceSquared < scaledRadius * scaledRadius;
}

/**
 * Calculate accuracy bonus based on distance from target center
 * @param {object} puckPos - Puck position {x, y}
 * @param {object} zone - Target zone
 * @returns {number} - Bonus points (0 to zone.accuracyBonusMax)
 */
function calculateAccuracyBonus(puckPos, zone) {
  // Calculate scaled target center
  const scaledPosition = scalePosition(zone.position);
  const scaledDimensions = scaleDimensions(zone.dimensions);

  const centerX = scaledPosition.x + scaledDimensions.width / 2;
  const centerY = scaledPosition.y + scaledDimensions.height / 2;

  // Calculate distance from center
  const distanceX = puckPos.x - centerX;
  const distanceY = puckPos.y - centerY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Calculate max distance (half diagonal of target)
  const maxDistance = Math.sqrt(
    (scaledDimensions.width / 2) ** 2 + (scaledDimensions.height / 2) ** 2
  );

  // Calculate accuracy (0 to 1, where 1 is perfect center hit)
  const accuracy = Math.max(0, 1 - distance / maxDistance);

  // Calculate bonus points
  const bonus = Math.round(accuracy * zone.accuracyBonusMax);

  return bonus;
}

/**
 * Check puck position against all target zones
 * @param {object} puckData - Puck data {position, velocity, speed}
 */
function checkPuckCollision(puckData) {
  const { position, velocity, speed } = puckData;

  // Puck collision radius - MUST MATCH visual puck size!
  // Visual puck is ~71px diameter (0.10 * 712), so radius = 35px
  // But for challenge, use SMALLER radius = 25px (strict collision)
  const puckRadius = 25; // Fixed radius, no speed scaling!

  // Check each zone
  for (const zone of zones.value) {
    // Skip if already hit recently
    if (zone.isHit && Date.now() - zone.hitTimestamp < HIT_ANIMATION_DURATION) {
      continue;
    }

    // Check collision
    if (checkCollision(position, puckRadius, zone)) {
      // Calculate accuracy bonus
      const accuracyBonus = calculateAccuracyBonus(position, zone);
      const totalScore = zone.points + accuracyBonus;

      // Mark zone as hit
      zone.isHit = true;
      zone.hitTimestamp = Date.now();

      // Reset hit state after animation
      setTimeout(() => {
        zone.isHit = false;
        zone.hitTimestamp = null;
      }, HIT_ANIMATION_DURATION);

      // Emit hit event
      emit('targetHit', {
        zoneId: zone.id,
        points: zone.points,
        accuracyBonus,
        totalScore,
        position: { ...position },
        velocity: { ...velocity },
      });

      console.log(
        `Target hit! Zone: ${zone.id}, Base: ${zone.points}, Bonus: ${accuracyBonus}, Total: ${totalScore}`
      );

      // Only detect one hit per frame
      return true;
    }
  }

  return false;
}

/**
 * Reset all targets to default state
 */
function resetTargets() {
  zones.value.forEach((zone) => {
    zone.isHit = false;
    zone.hitTimestamp = null;
  });
}

/**
 * Public method: Check collision (called from parent)
 */
function checkCollisionWithPuck(puckData) {
  return checkPuckCollision(puckData);
}

// Expose methods to parent
defineExpose({
  checkCollisionWithPuck,
  resetTargets,
});
</script>

<style scoped lang="scss">
.target-zones {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; // Below character (z: 2) and puck (z: 3)
}

.target-zone {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;

  &.target-hit {
    transform: scale(1.2);
    animation: pulse 0.3s ease-out;
  }
}

.target-sprite {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.6; // Increased to match Figma visibility (was 0.2, too subtle)
  transition: opacity 0.2s ease;

  .target-hit & {
    opacity: 1;
  }
}

.target-points {
  position: absolute;
  bottom: -20px;
  @include text-medium;
  font-size: $font-size-small;
  color: $color-primary-blue; // Blue for better contrast on white ice
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8); // White shadow for extra readability
  pointer-events: none;
  opacity: 0.8; // More visible on white background
  font-weight: 700; // Bold for better legibility
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
  }
}
</style>
