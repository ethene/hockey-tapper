<template>
  <div
    v-if="combo > 0"
    class="combo-display"
    :class="{ 'combo-display--milestone': isMilestone }"
  >
    <span class="combo-display__count">{{ combo }} HITS</span>
    <span class="combo-display__separator">•</span>
    <span class="combo-display__multiplier">{{ multiplierText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  combo: {
    type: Number,
    required: true,
    default: 0,
  },
  multiplier: {
    type: Number,
    required: true,
    default: 1.0,
  },
});

// Combo milestones for special styling
const MILESTONES = [5, 10, 15, 20];

/**
 * Check if current combo is a milestone
 */
const isMilestone = computed(() => {
  return MILESTONES.includes(props.combo);
});

/**
 * Format multiplier as text (e.g., "1.2x")
 */
const multiplierText = computed(() => {
  return `${props.multiplier.toFixed(1)}x`;
});
</script>

<style scoped lang="scss">
.combo-display {
  position: fixed;
  top: 80px; // Below TopBar
  right: $spacing-lg;
  z-index: 6; // Above feedback (z-index: 5)

  display: flex;
  align-items: center;
  gap: $spacing-sm;

  padding: $spacing-sm $spacing-md;
  background: rgba(0, 0, 0, 0.7);
  border-radius: $radius-base;
  border: 2px solid $color-secondary-blue;

  @include text-base;
  font-size: 14px;
  font-weight: 700;
  color: $color-secondary-blue-bright;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

  user-select: none;
  pointer-events: none;

  // Smooth transitions
  transition: all 0.2s ease-out;

  &--milestone {
    border-color: $color-accent-gold;
    background: rgba(255, 215, 0, 0.2);
    animation: pulse 0.6s ease-in-out;
  }
}

.combo-display__count {
  font-weight: 700;
}

.combo-display__separator {
  opacity: 0.6;
}

.combo-display__multiplier {
  color: $color-accent-gold;
  font-weight: 700;
}

// Pulse animation for milestones
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

// Responsive adjustments
@media (max-width: 374px) {
  .combo-display {
    top: 70px;
    right: $spacing-md;
    padding: $spacing-xs $spacing-sm;
    font-size: 11px;
  }
}

@media (min-width: 768px) {
  .combo-display {
    top: 90px;
    right: $spacing-xl;
  }
}
</style>
