<template>
  <div class="scoreboard">
    <div class="scoreboard__section">
      <span class="scoreboard__label">Score</span>
      <span class="scoreboard__value">{{ formattedScore }}</span>
    </div>
    <div class="scoreboard__divider" />
    <div class="scoreboard__section">
      <span class="scoreboard__label">Time</span>
      <span class="scoreboard__value scoreboard__value--timer">
        {{ formattedTimer }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: {
    type: Number,
    default: 0,
  },
  timer: {
    type: Number,
    default: 30,
  },
});

const formattedScore = computed(() => {
  return props.score.toLocaleString();
});

const formattedTimer = computed(() => {
  const seconds = Math.max(0, props.timer);
  return `${seconds}s`;
});
</script>

<style scoped lang="scss">
.scoreboard {
  @include flex-row;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  max-width: 335px;
  height: $points-frame-height;
  padding: $spacing-lg $spacing-xl;
  background-color: $color-text-primary;
  border-radius: $radius-base;
  margin-bottom: $spacing-2xl;
}

.scoreboard__section {
  @include flex-column;
  align-items: center;
  gap: $spacing-xs;
  flex: 1;
}

.scoreboard__label {
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scoreboard__value {
  @include text-large-bold;
  color: $color-white;
}

.scoreboard__value--timer {
  color: $color-secondary-blue-light;
}

.scoreboard__divider {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 $spacing-lg;
}
</style>
