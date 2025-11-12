<template>
  <div class="top-bar">
    <div class="top-bar__content">
      <div class="top-bar__user">
        <span class="top-bar__username">{{ username }}</span>
      </div>
      <div class="top-bar__info">
        <div class="top-bar__badge">Hockey Tapper</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  username: {
    type: String,
    default: 'Player',
  },
});
</script>

<style scoped lang="scss">
.top-bar {
  position: relative;
  width: 100%;
  padding: $spacing-lg;
  padding-top: calc($spacing-2xl + env(safe-area-inset-top, 0px));
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: $z-nav;
}

.top-bar__content {
  @include flex-row;
  justify-content: space-between;
  align-items: center;
}

.top-bar__user {
  @include flex-column;
}

.top-bar__username {
  @include text-medium;
  color: $color-text-primary;
}

.top-bar__info {
  @include flex-row;
  align-items: center;
}

.top-bar__badge {
  padding: $spacing-xs $spacing-md;
  background-color: $color-accent-light;
  border-radius: $radius-base;
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
}
</style>
