<template>
  <div class="leaderboard">
    <h3 class="leaderboard__title">Top Players</h3>

    <div v-if="loading" class="leaderboard__loading">
      Loading...
    </div>

    <div v-else-if="error" class="leaderboard__error">
      Failed to load leaderboard
    </div>

    <div v-else-if="entries.length === 0" class="leaderboard__empty">
      No scores yet. Be the first!
    </div>

    <ul v-else class="leaderboard__list">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="leaderboard__item"
      >
        <span class="leaderboard__rank">{{ entry.rank }}</span>
        <span class="leaderboard__user">{{ entry.userId || entry.username }}</span>
        <span class="leaderboard__score">{{ entry.score.toLocaleString() }}</span>
      </li>
    </ul>

    <!-- Reset button (demo mode only) -->
    <button
      v-if="isDemo && entries.length > 0"
      class="leaderboard__reset"
      @click="handleReset"
      :disabled="resetting"
    >
      {{ resetting ? 'Clearing...' : 'Reset Scores (Demo)' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getLeaderboard, isDemoMode, clearLeaderboard } from '../services/api.js';

const entries = ref([]);
const loading = ref(true);
const error = ref(false);
const resetting = ref(false);

// Check if in demo mode
const isDemo = computed(() => isDemoMode());

const fetchLeaderboard = async () => {
  loading.value = true;
  error.value = false;
  try {
    const data = await getLeaderboard(10);
    // Add rank to each entry
    entries.value = data.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  if (!confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
    return;
  }

  resetting.value = true;
  try {
    await clearLeaderboard();
    entries.value = [];
    console.log('[DEMO] Leaderboard cleared');
  } catch (err) {
    console.error('Failed to clear leaderboard:', err);
    alert('Failed to clear leaderboard. Please try again.');
  } finally {
    resetting.value = false;
  }
};

onMounted(() => {
  fetchLeaderboard();
});

defineExpose({ fetchLeaderboard });
</script>

<style scoped lang="scss">
.leaderboard {
  @include flex-column;
  width: 100%;
  gap: $spacing-md;
}

.leaderboard__title {
  @include text-medium;
  font-size: $font-size-base;
  text-align: center;
  color: $color-text-primary;
  margin: 0;
}

.leaderboard__loading,
.leaderboard__error,
.leaderboard__empty {
  text-align: center;
  padding: $spacing-xl;
  color: rgba(0, 0, 0, 0.5);
  font-size: $font-size-small;
}

.leaderboard__list {
  list-style: none;
  padding: 0;
  margin: 0;
  @include flex-column;
  gap: $spacing-xs;
}

.leaderboard__item {
  @include flex-row;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: $radius-base;
  font-size: $font-size-small;
}

.leaderboard__rank {
  font-weight: $font-weight-bold;
  color: $color-primary-blue;
  min-width: 24px;
  text-align: center;
}

.leaderboard__user {
  flex: 1;
  color: $color-text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leaderboard__score {
  font-weight: $font-weight-medium;
  color: $color-text-primary;
}

.leaderboard__reset {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  margin-top: $spacing-md;
  border-radius: $radius-base;
  border: none;
  background-color: rgba(251, 57, 58, 0.1);
  color: $color-primary-red;
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(251, 57, 58, 0.2);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: $opacity-medium;
    cursor: not-allowed;
  }
}
</style>
