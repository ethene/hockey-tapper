<template>
  <div class="game-screen">
    <!-- Background stadium image -->
    <div class="game-background" />

    <!-- Top navigation/status bar -->
    <TopBar :username="username" />

    <!-- Main game area -->
    <div class="game-content">
      <!-- Target zones (behind character) -->
      <TargetZones
        ref="targetZonesRef"
        @target-hit="handleTargetHit"
        @target-missed="handlePuckMissed"
      />

      <!-- Puck canvas (above targets, below character) -->
      <PuckCanvas
        ref="puckCanvasRef"
        :width="canvasDimensions.width"
        :height="canvasDimensions.height"
        :show-trail="true"
        @puck-launched="() => console.log('Puck launched')"
        @puck-landed="handlePuckLanded"
        @puck-missed="handlePuckMissed"
        @position-update="handlePuckPositionUpdate"
      />

      <!-- Particle effects canvas (above puck, below feedback) -->
      <ParticleCanvas
        :width="canvasDimensions.width"
        :height="canvasDimensions.height"
      />

      <!-- Score display -->
      <ScoreBoard :score="score" :timer="timer" />

      <!-- Combo display (top-right) -->
      <ComboDisplay :combo="combo" :multiplier="multiplier" />

      <!-- Character animation (responsive) -->
      <div class="character-container">
        <CharacterAnimation
          ref="characterRef"
          :width="180"
          :height="180"
          :scale="1"
          @shot-triggered="handleShotTriggered"
          @animation-complete="handleAnimationComplete"
          @state-change="handleStateChange"
        />
      </div>

      <!-- Tappable puck area -->
      <TapButton
        :disabled="!isPlaying || shotInProgress"
        @tap="handleTap"
      />

      <!-- Visual feedback (Goal/Miss text, score popups) -->
      <FeedbackAnimation ref="feedbackRef" />
    </div>

    <!-- Modal for game end -->
    <AppModal
      v-if="showModal"
      :score="score"
      @close="handleModalClose"
      @restart="handleRestart"
      @username-change="handleUsernameChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import TopBar from './TopBar.vue';
import ScoreBoard from './ScoreBoard.vue';
import TapButton from './TapButton.vue';
import AppModal from './AppModal.vue';
import CharacterAnimation from './CharacterAnimation.vue';
import PuckCanvas from './PuckCanvas.vue';
import TargetZones from './TargetZones.vue';
import FeedbackAnimation from './FeedbackAnimation.vue';
import ParticleCanvas from './ParticleCanvas.vue';
import ComboDisplay from './ComboDisplay.vue';
import { saveScore } from '../services/api.js';
import { useSound } from '../composables/useSound.js';
import { useParticles } from '../composables/useParticles.js';
import { useCombo } from '../composables/useCombo.js';
import { useCanvasScaling } from '../composables/useCanvasScaling.js';

// Sound effects composable
const { playSound, preloadSounds, isPreloaded } = useSound();

// Particle effects composable
const { spawnParticles } = useParticles();

// Combo system composable
const { combo, multiplier, incrementCombo, resetCombo } = useCombo();

// Canvas scaling for responsive dimensions
const { canvasDimensions } = useCanvasScaling();

// Game state
const score = ref(0);
const timer = ref(30);
const isPlaying = ref(false);
const showModal = ref(false);
const username = ref('Player');
const isSavingScore = ref(false);
const shotInProgress = ref(false);

// Component refs
const characterRef = ref(null);
const puckCanvasRef = ref(null);
const targetZonesRef = ref(null);
const feedbackRef = ref(null);

let timerInterval = null;

// Watch timer for tick sound (last 5 seconds)
watch(timer, (newValue) => {
  if (isPlaying.value && newValue > 0 && newValue <= 5) {
    playSound('tick');
  }
});

// Handle tap on puck - trigger character animation
const handleTap = () => {
  if (!isPlaying.value || shotInProgress.value) return;

  // Play shoot sound
  playSound('shoot');

  // Trigger character shot animation
  if (characterRef.value) {
    const success = characterRef.value.triggerShot();
    if (!success) {
      console.log('Could not trigger shot - animation busy');
    }
  }
};

// Handle shot triggered event
const handleShotTriggered = () => {
  shotInProgress.value = true;
  console.log('Shot animation started');
};

// Handle animation complete event (shot sequence finished)
const handleAnimationComplete = () => {
  // Don't clear shotInProgress yet - wait for puck to land

  // Launch puck after hit animation completes
  if (puckCanvasRef.value && isPlaying.value) {
    // CORRECTED CHARACTER POSITION:
    // Layout: padding-top(120) + ScoreBoard(60) + ComboDisplay(40) + Character(180)
    // Character center: ~310px, bottom (stick): ~400px
    // Launch from character's stick position (bottom of character)
    const characterStickY = 410; // Fixed position where character's stick is
    const characterX = canvasDimensions.value.width / 2; // Center horizontally

    const launchPos = {
      x: characterX,
      y: characterStickY,
    };

    // FULL 360-DEGREE SHOOTING: Targets surround the player in a circle!
    // Angle range: 0-360 degrees
    // - 0° = right →
    // - 90° = up ↑ (top target)
    // - 180° = left ←
    // - 270° = down ↓
    // - 45° = top-right (middle-right target)
    // - 135° = top-left (middle-left target)
    // - 315° = bottom-right target
    // - 225° = bottom-left target
    const finalAngle = Math.random() * 360; // Full circle!

    // POWER VARIATION: 0.6-1.0 (need decent power to reach targets)
    // - Weak (0.6-0.7) = reaches nearby targets
    // - Medium (0.7-0.85) = reaches most targets
    // - Strong (0.85-1.0) = reaches far targets
    const power = 0.6 + Math.random() * 0.4;

    puckCanvasRef.value.launch(finalAngle, power, launchPos);
    console.log(`🏒 Shot: ${finalAngle.toFixed(0)}° @ ${(power*100).toFixed(0)}% power (from y=${characterStickY})`);
  }
};

// Handle animation state changes
const handleStateChange = ({ newState, oldState }) => {
  console.log(`Animation: ${oldState} → ${newState}`);
};

// Handle puck position updates (for collision detection)
const handlePuckPositionUpdate = (puckData) => {
  if (!isPlaying.value || !targetZonesRef.value) return;

  // Check collision with targets
  targetZonesRef.value.checkCollisionWithPuck(puckData);
};

// Handle target hit
const handleTargetHit = ({ zoneId, points, accuracyBonus, totalScore, position }) => {
  if (!isPlaying.value) return;

  // Increment combo and check for milestone
  const milestone = incrementCombo();

  // Play goal sound
  playSound('goal');

  // Spawn particle effect at hit position
  spawnParticles({
    x: position.x,
    y: position.y,
    type: 'goal',
  });

  // Check for combo milestone - spawn enhanced particles and play combo sound
  if (milestone) {
    spawnParticles({
      x: position.x,
      y: position.y,
      type: 'combo',
      count: 40,
    });
    playSound('combo');

    // Show combo feedback
    if (feedbackRef.value) {
      feedbackRef.value.showCombo(multiplier.value);
    }

    console.log(`🎉 Combo milestone reached: ${milestone} hits! Multiplier: ${multiplier.value}x`);
  }

  // Apply combo multiplier to score
  const multipliedScore = Math.floor(totalScore * multiplier.value);
  score.value += multipliedScore;
  console.log(`Target hit! Zone: ${zoneId}, Score: +${multipliedScore} (base: ${totalScore}, multiplier: ${multiplier.value}x, combo: ${combo.value})`);

  // Show feedback
  if (feedbackRef.value) {
    if (!milestone) {
      // Only show Goal! text if not showing combo
      feedbackRef.value.showGoal();
    }
    feedbackRef.value.showScorePopup(multipliedScore, position);
  }

  // Stop puck after hit
  if (puckCanvasRef.value) {
    puckCanvasRef.value.stopPuck();
  }

  // Clear shot in progress
  shotInProgress.value = false;
};

// Handle puck missed (out of bounds without hitting target)
const handlePuckMissed = () => {
  console.log('Puck missed - no target hit');

  // Reset combo on miss
  if (combo.value > 0) {
    console.log(`💔 Combo broken at ${combo.value} hits`);
    resetCombo();
  }

  // Play miss sound
  playSound('miss');

  // Show miss feedback
  if (feedbackRef.value) {
    feedbackRef.value.showMiss();
  }

  // Clear shot in progress
  shotInProgress.value = false;
};

// Handle puck landed (stopped flying)
const handlePuckLanded = () => {
  // This fires when puck stops, regardless of hit/miss
  // The targetHit or puckMissed handlers will have already fired
  console.log('Puck landed');
};

// Start game
const startGame = () => {
  score.value = 0;
  timer.value = 30;
  isPlaying.value = true;
  showModal.value = false;
  shotInProgress.value = false;

  // Reset combo
  resetCombo();

  // Reset puck and targets
  if (puckCanvasRef.value) {
    puckCanvasRef.value.reset();
  }
  if (targetZonesRef.value) {
    targetZonesRef.value.resetTargets();
  }
  if (feedbackRef.value) {
    feedbackRef.value.hideAll();
  }

  timerInterval = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      endGame();
    }
  }, 1000);
};

// End game
const endGame = async () => {
  isPlaying.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Save score to backend
  if (score.value > 0) {
    isSavingScore.value = true;
    try {
      await saveScore(score.value, username.value);
      console.log('✅ Score saved successfully:', score.value);
    } catch (error) {
      console.error('❌ Failed to save score:', error);
      // Still show modal even if save fails
    } finally {
      isSavingScore.value = false;
    }
  }

  showModal.value = true;
};

// Modal handlers
const handleModalClose = () => {
  showModal.value = false;
};

const handleRestart = () => {
  startGame();
};

const handleUsernameChange = (newUsername) => {
  console.log('Username changed:', newUsername);
  username.value = newUsername || 'Player';
};

// Lifecycle
onMounted(async () => {
  // Preload sounds (non-blocking, failures handled gracefully)
  try {
    await preloadSounds();
    console.log('✅ Sound effects ready');
  } catch (error) {
    console.warn('⚠️ Sound effects unavailable:', error.message);
    // Game continues without sounds
  }

  // Auto-start game on mount
  startGame();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped lang="scss">
.game-screen {
  @include mobile-frame;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.game-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/stadium-background.png');
  background-size: cover;
  background-position: center;
  z-index: $z-background;
}

.game-content {
  position: relative;
  @include flex-column;
  align-items: center;
  flex: 1;
  padding: $spacing-lg;
  padding-top: 120px;
  z-index: $z-content;
}

.character-container {
  position: relative;
  // Fixed size since game container is capped at 375px (mobile-first for Telegram)
  width: 180px;
  height: 180px;
  margin-bottom: $spacing-xl;
  z-index: 2; // Above game content (z-content: 1)

  // Slightly smaller on compact devices only
  @media (max-width: 374px) {
    width: 150px;
    height: 150px;
  }
}
</style>
