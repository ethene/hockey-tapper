<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
// Main app shell - routing handled by vue-router
</script>

<style scoped lang="scss">
.app {
  @include mobile-frame;
  position: relative;
  background-color: $color-white;
}
</style>
