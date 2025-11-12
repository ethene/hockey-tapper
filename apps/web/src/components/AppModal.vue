<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal" @click.stop>
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
        <button class="modal__button modal__button--secondary" @click="handleClose">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import Leaderboard from './Leaderboard.vue';

const props = defineProps({
  score: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'restart', 'usernameChange']);

const leaderboardRef = ref(null);
const username = ref('Player');

const STORAGE_KEY = 'hockey_tapper_username';

const formattedScore = computed(() => {
  return props.score.toLocaleString();
});

// Load username from localStorage on mount
onMounted(() => {
  const savedUsername = localStorage.getItem(STORAGE_KEY);
  if (savedUsername) {
    username.value = savedUsername;
  }
});

const handleUsernameChange = () => {
  // Save to localStorage
  const trimmed = username.value.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
    emit('usernameChange', trimmed);
  }
};

const handleClose = () => {
  emit('close');
};

const handleRestart = () => {
  emit('restart');
};

const handleOverlayClick = () => {
  emit('close');
};

// Refresh leaderboard when modal opens
watch(() => props.score, () => {
  setTimeout(() => {
    leaderboardRef.value?.fetchLeaderboard();
  }, 500);
});

// Emit current username when modal opens
watch(() => props.score, () => {
  if (props.score > 0) {
    emit('usernameChange', username.value || 'Player');
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
  @include flex-center;
  background-color: rgba(0, 0, 0, 0.6);
  @include backdrop-blur($blur-medium);
  z-index: $z-modal;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  @include flex-column;
  width: calc(100% - 2 * $spacing-2xl);
  max-width: 400px;
  background-color: $color-white;
  border-radius: $radius-lg;
  padding: $spacing-2xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.modal__header {
  margin-bottom: $spacing-xl;
  text-align: center;
}

.modal__title {
  @include text-xlarge;
  color: $color-text-primary;
  margin: 0;
}

.modal__body {
  @include flex-column;
  gap: $spacing-lg;
  margin-bottom: $spacing-2xl;
}

.modal__score-section {
  @include flex-column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xl;
  background: linear-gradient(
    135deg,
    $color-accent-light 0%,
    $color-secondary-blue-light 100%
  );
  border-radius: $radius-base;
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
}

.modal__button {
  width: 100%;
  padding: $spacing-lg;
  border-radius: $radius-base;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  transition: all 0.2s ease;

  &--primary {
    background-color: $color-primary-blue;
    color: $color-white;

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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
