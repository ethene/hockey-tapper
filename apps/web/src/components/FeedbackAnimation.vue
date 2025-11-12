<template>
  <div class="feedback-container">
    <!-- Goal/Miss feedback -->
    <Transition name="feedback">
      <div
        v-if="showFeedback"
        class="feedback-text"
        :class="[feedbackType, animationClass]"
      >
        {{ feedbackText }}
      </div>
    </Transition>

    <!-- Score popup -->
    <Transition name="score">
      <div
        v-if="showScore"
        class="score-popup"
        :style="scoreStyle"
      >
        +{{ scoreValue }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { FEEDBACK_CONFIG } from '@/config/animations.js';

// Feedback state
const showFeedback = ref(false);
const feedbackType = ref('goal'); // 'goal' | 'miss'
const feedbackText = ref('');
const animationClass = ref('');

// Score popup state
const showScore = ref(false);
const scoreValue = ref(0);
const scorePosition = ref({ x: 0, y: 0 });

// Timeouts for auto-hide
let feedbackTimeout = null;
let scoreTimeout = null;

/**
 * Show goal feedback
 */
function showGoal() {
  clearFeedbackTimeout();

  feedbackType.value = 'goal';
  feedbackText.value = FEEDBACK_CONFIG.goal.text;
  animationClass.value = FEEDBACK_CONFIG.goal.animationType;
  showFeedback.value = true;

  feedbackTimeout = setTimeout(() => {
    showFeedback.value = false;
  }, FEEDBACK_CONFIG.goal.duration);
}

/**
 * Show miss feedback
 */
function showMiss() {
  clearFeedbackTimeout();

  feedbackType.value = 'miss';
  feedbackText.value = FEEDBACK_CONFIG.miss.text;
  animationClass.value = FEEDBACK_CONFIG.miss.animationType;
  showFeedback.value = true;

  feedbackTimeout = setTimeout(() => {
    showFeedback.value = false;
  }, FEEDBACK_CONFIG.miss.duration);
}

/**
 * Show combo feedback
 * @param {number} multiplier - Current combo multiplier (e.g., 1.2, 1.5, 2.0, 3.0)
 */
function showCombo(multiplier) {
  clearFeedbackTimeout();

  feedbackType.value = 'combo';
  feedbackText.value = `${multiplier.toFixed(1)}x Combo!`;
  animationClass.value = FEEDBACK_CONFIG.combo.animationType;
  showFeedback.value = true;

  feedbackTimeout = setTimeout(() => {
    showFeedback.value = false;
  }, FEEDBACK_CONFIG.combo.duration);
}

/**
 * Show score popup at specific position
 * @param {number} score - Score value to display
 * @param {object} position - Position {x, y} where puck hit target
 */
function showScorePopup(score, position = null) {
  clearScoreTimeout();

  scoreValue.value = score;

  // Set position (default to center if not provided)
  if (position) {
    scorePosition.value = { ...position };
  } else {
    scorePosition.value = { x: 187, y: 300 }; // Center of viewport
  }

  showScore.value = true;

  scoreTimeout = setTimeout(() => {
    showScore.value = false;
  }, FEEDBACK_CONFIG.score.duration);
}

/**
 * Clear feedback timeout
 */
function clearFeedbackTimeout() {
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
  }
  showFeedback.value = false;
}

/**
 * Clear score timeout
 */
function clearScoreTimeout() {
  if (scoreTimeout) {
    clearTimeout(scoreTimeout);
    scoreTimeout = null;
  }
  showScore.value = false;
}

/**
 * Hide all feedback
 */
function hideAll() {
  clearFeedbackTimeout();
  clearScoreTimeout();
}

/**
 * Computed style for score popup (positioned at hit location)
 */
const scoreStyle = computed(() => {
  return {
    left: `${scorePosition.value.x}px`,
    top: `${scorePosition.value.y}px`,
  };
});

// Expose methods to parent
defineExpose({
  showGoal,
  showMiss,
  showCombo,
  showScorePopup,
  hideAll,
});
</script>

<style scoped lang="scss">
.feedback-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5; // Above everything except modal
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  @include text-large-bold;
  color: $color-secondary-blue;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  user-select: none;

  &.goal {
    color: $color-secondary-blue;
  }

  &.miss {
    color: $color-primary-red;
  }

  &.combo {
    color: $color-accent-gold;
    font-size: 28px;
  }

  // Animation types
  &.popup {
    animation: popup 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  &.shake {
    animation: shake 0.5s ease-in-out;
  }

  &.fade {
    animation: fade 0.5s ease-in-out;
  }
}

.score-popup {
  position: absolute;
  transform: translate(-50%, -50%);
  @include text-large-bold;
  color: $color-secondary-blue-bright;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
  user-select: none;
  animation: slideUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

// Transition animations
.feedback-enter-active,
.feedback-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

.feedback-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.2);
}

.score-enter-active,
.score-leave-active {
  transition: opacity 0.3s ease;
}

.score-enter-from {
  opacity: 0;
}

.score-leave-to {
  opacity: 0;
}

// Keyframe animations
@keyframes popup {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translate(-50%, -50%) rotate(-5deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translate(-50%, -50%) rotate(5deg);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(0);
  }
  10% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-100px);
  }
}
</style>
