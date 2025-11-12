import { ref, computed, onMounted, onUnmounted } from 'vue';
import { VIEWPORT_CONFIG } from '@/config/animations.js';

/**
 * Composable for responsive viewport detection
 * Tracks viewport size and determines current breakpoint
 *
 * @returns {object} - Viewport state and breakpoint information
 */
export function useViewport() {
  // Reactive viewport dimensions
  const viewportWidth = ref(window.innerWidth);
  const viewportHeight = ref(window.innerHeight);

  /**
   * Determine current breakpoint based on viewport width
   */
  const currentBreakpoint = computed(() => {
    const width = viewportWidth.value;
    const breakpoints = VIEWPORT_CONFIG.breakpoints;

    if (width >= breakpoints.desktop.min) return 'desktop';
    if (width >= breakpoints.tablet.min) return 'tablet';
    if (width >= breakpoints.mobile.min) return 'mobile';
    return 'compact';
  });

  /**
   * Convenience computed properties for breakpoint checks
   */
  const isCompact = computed(() => currentBreakpoint.value === 'compact');
  const isMobile = computed(() => currentBreakpoint.value === 'mobile');
  const isTablet = computed(() => currentBreakpoint.value === 'tablet');
  const isDesktop = computed(() => currentBreakpoint.value === 'desktop');

  /**
   * Check if viewport is at or below mobile size
   */
  const isMobileOrSmaller = computed(() => isCompact.value || isMobile.value);

  /**
   * Check if viewport is at or above tablet size
   */
  const isTabletOrLarger = computed(() => isTablet.value || isDesktop.value);

  /**
   * Get aspect ratio of current viewport
   */
  const aspectRatio = computed(() => {
    return viewportWidth.value / viewportHeight.value;
  });

  /**
   * Check if viewport is landscape orientation
   */
  const isLandscape = computed(() => aspectRatio.value > 1);

  /**
   * Check if viewport is portrait orientation
   */
  const isPortrait = computed(() => aspectRatio.value <= 1);

  /**
   * Debounce timer for resize events
   */
  let resizeTimeout = null;

  /**
   * Update viewport dimensions
   * Debounced to avoid excessive recalculations
   */
  const updateViewport = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      viewportWidth.value = window.innerWidth;
      viewportHeight.value = window.innerHeight;
    }, 100); // 100ms debounce
  };

  /**
   * Resize event listener
   */
  const handleResize = () => {
    updateViewport();
  };

  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('resize', handleResize);
    console.log('[useViewport] Initialized:', {
      width: viewportWidth.value,
      height: viewportHeight.value,
      breakpoint: currentBreakpoint.value,
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    console.log('[useViewport] Cleanup complete');
  });

  return {
    // Viewport dimensions
    viewportWidth,
    viewportHeight,
    aspectRatio,

    // Current breakpoint
    currentBreakpoint,

    // Breakpoint checks
    isCompact,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrSmaller,
    isTabletOrLarger,

    // Orientation
    isLandscape,
    isPortrait,
  };
}
