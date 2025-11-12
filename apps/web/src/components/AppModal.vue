<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">Game Over!</h2>
      </div>

      <div class="modal__body">
        <div class="modal__score-section">
          <span class="modal__score-label">Final Score</span>
          <span class="modal__score-value">{{ formattedScore }}</span>
        </div>

        <div class="modal__username-section">
          <label for="username-input" class="modal__username-label">
            Your Name
          </label>
          <input
            id="username-input"
            v-model="username"
            type="text"
            class="modal__username-input"
            placeholder="Enter your name"
            maxlength="20"
            @input="handleUsernameChange"
            @keyup.enter="handleUsernameSubmit"
          />
        </div>

        <p class="modal__message">
          Great job! Your score has been recorded.
        </p>

        <Leaderboard ref="leaderboardRef" />
      </div>

      <div class="modal__actions">
        <button class="modal__button modal__button--primary" @click="handleRestart">
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Leaderboard from './Leaderboard.vue';
import { updateRecentUsername } from '../services/api.js';

const props = defineProps({
  score: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['restart', 'usernameChange']);

const leaderboardRef = ref(null);

const STORAGE_KEY = 'hockey_tapper_username';

// Load username from localStorage immediately (before watchers run!)
const username = ref(localStorage.getItem(STORAGE_KEY) || 'Player');

// Track the original username when modal opens (for updating scores)
const originalUsername = ref(username.value);

const formattedScore = computed(() => {
  return props.score.toLocaleString();
});

const handleUsernameChange = () => {
  // Save to localStorage
  const trimmed = username.value.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
    emit('usernameChange', trimmed);
  }
};

const handleUsernameSubmit = async (event) => {
  // Blur the input to dismiss keyboard on mobile
  event.target.blur();

  // Ensure the username is saved
  handleUsernameChange();

  // Update recent scores if username changed
  const newUsername = username.value.trim() || 'Player';
  if (originalUsername.value !== newUsername) {
    try {
      await updateRecentUsername(originalUsername.value, newUsername);
      console.log(`Username updated from "${originalUsername.value}" to "${newUsername}"`);
    } catch (error) {
      console.error('Failed to update username on scores:', error);
    }
  }

  // Refresh leaderboard to show updated name
  setTimeout(() => {
    leaderboardRef.value?.fetchLeaderboard();
  }, 300);
};

const handleRestart = () => {
  emit('restart');
};

// Refresh leaderboard and emit username when modal opens
watch(() => props.score, (newScore) => {
  if (newScore > 0) {
    // Store the original username when modal opens
    originalUsername.value = username.value || 'Player';

    // Emit current username
    emit('usernameChange', username.value || 'Player');

    // Refresh leaderboard after a short delay
    setTimeout(() => {
      leaderboardRef.value?.fetchLeaderboard();
    }, 500);
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start; // Align to top
  justify-content: center;
  padding-top: 5vh; // Start higher - 5% from top
  padding-bottom: 5vh; // 5% from bottom
  background-color: rgba(0, 0, 0, 0.6);
  @include backdrop-blur($blur-medium);
  z-index: $z-modal;
  animation: fadeIn 0.2s ease-out;
  overflow-y: auto; // Allow scrolling if needed
}

.modal {
  @include flex-column;
  width: 100%; // Full width
  max-width: 375px; // Match mobile frame width
  max-height: 85vh; // Reduced from 90vh to fit better
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg $spacing-lg; // Reduced top padding
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.modal__header {
  margin-bottom: $spacing-sm; // Reduced from md
  text-align: center;
  flex-shrink: 0; // Don't shrink header
}

.modal__title {
  @include text-xlarge;
  color: $color-text-primary;
  margin: 0;
}

.modal__body {
  @include flex-column;
  gap: $spacing-sm; // Reduced from md for more compact layout
  flex: 1; // Grow to fill available space
  overflow-y: auto; // Enable scrolling only within body if needed
  min-height: 0; // Allow flexbox to shrink below content size
}

.modal__score-section {
  @include flex-column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-lg; // Reduced from xl
  background: linear-gradient(
    135deg,
    $color-accent-light 0%,
    $color-secondary-blue-light 100%
  );
  border-radius: $radius-base;
  flex-shrink: 0; // Don't shrink this section
}

.modal__score-label {
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  opacity: $opacity-high;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__score-value {
  @include text-xlarge;
  font-weight: $font-weight-bold;
  color: $color-primary-blue;
}

.modal__username-section {
  @include flex-column;
  gap: $spacing-sm;
}

.modal__username-label {
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  opacity: $opacity-medium;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__username-input {
  width: 100%;
  padding: $spacing-md $spacing-lg;
  border-radius: $radius-base;
  border: $stroke-base solid rgba(0, 0, 0, 0.1);
  font-size: $font-size-base;
  color: $color-text-primary;
  background-color: $color-white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: $color-primary-blue;
    box-shadow: 0 0 0 3px rgba(64, 79, 160, 0.1);
  }

  &::placeholder {
    color: $color-text-primary;
    opacity: $opacity-low;
  }
}

.modal__message {
  text-align: center;
  @include text-base;
  color: $color-text-primary;
  opacity: $opacity-high;
  line-height: 1.6;
}

.modal__actions {
  @include flex-column;
  gap: $spacing-md;
  flex-shrink: 0; // Don't shrink button area
  margin-top: $spacing-md; // Space from leaderboard
}

.modal__button {
  width: 100%;
  padding: $spacing-lg;
  border-radius: $radius-base;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;

  &--primary {
    background-color: $color-primary-blue;
    color: $color-white;
    border: none;

    &:hover {
      background-color: darken(#404fa0, 10%);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &--secondary {
    background-color: transparent;
    color: $color-text-primary;
    border: $stroke-base solid rgba(0, 0, 0, 0.1);

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
