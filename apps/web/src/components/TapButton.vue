<template>
  <button
    class="tap-button"
    :class="{ 'tap-button--disabled': disabled, 'tap-button--active': isActive }"
    :disabled="disabled"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="tap-button__inner">
      <img
        src="/assets/puck/puck-default.png"
        alt="Hockey Puck"
        class="tap-button__image"
      >
      <div class="tap-button__glow" />
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['tap']);

const isActive = ref(false);

const handleClick = () => {
  if (isActive.value) return;
  emit('tap');
  triggerAnimation();
};

const handleTouchStart = () => {
  isActive.value = true;
};

const handleTouchEnd = () => {
  isActive.value = false;
  emit('tap');
  triggerAnimation();
};

const triggerAnimation = () => {
  isActive.value = true;
  setTimeout(() => {
    isActive.value = false;
  }, 150);
};
</script>

<style scoped lang="scss">
.tap-button {
  position: relative;
  // Fixed size since game container is capped at 375px (mobile-first for Telegram)
  width: $button-size-base;
  height: $button-size-base;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease-out;
  touch-action: manipulation;

  // Slightly smaller on compact devices only
  @media (max-width: 374px) {
    width: 70px;
    height: 70px;
  }

  &:active,
  &.tap-button--active {
    transform: scale(0.9);
  }

  &.tap-button--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.tap-button__inner {
  position: relative;
  width: 100%;
  height: 100%;
  @include flex-center;
}

.tap-button__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

.tap-button__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle,
    rgba(111, 168, 255, 0.4) 0%,
    rgba(111, 168, 255, 0) 70%
  );
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

.tap-button--active .tap-button__glow {
  animation: tap-pulse 0.3s ease-out forwards;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes tap-pulse {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}
</style>
