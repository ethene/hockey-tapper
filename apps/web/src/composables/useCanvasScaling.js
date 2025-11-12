import { computed } from 'vue';
import { VIEWPORT_CONFIG } from '@/config/animations.js';
import { useViewport } from './useViewport.js';

/**
 * Composable for responsive canvas scaling
 * Calculates scale factors to maintain proper sizing across viewports
 *
 * @returns {object} - Scaling utilities and computed dimensions
 */
export function useCanvasScaling() {
  const viewport = useViewport();

  // Base dimensions from Figma design (mobile-first: 375x812)
  const baseDimensions = VIEWPORT_CONFIG.baseCanvasDimensions;

  /**
   * Calculate scale factor based on viewport width
   * Maintains aspect ratio relative to base design
   */
  const scaleX = computed(() => {
    return viewport.viewportWidth.value / baseDimensions.width;
  });

  /**
   * Calculate scale factor based on viewport height
   * Maintains aspect ratio relative to base design
   */
  const scaleY = computed(() => {
    return viewport.viewportHeight.value / baseDimensions.height;
  });

  /**
   * Uniform scale factor (use smaller of scaleX/scaleY to avoid overflow)
   * This ensures content fits within viewport
   */
  const uniformScale = computed(() => {
    return Math.min(scaleX.value, scaleY.value);
  });

  /**
   * Adaptive scale factor based on breakpoint
   * Provides more controlled scaling for different screen sizes
   */
  const adaptiveScale = computed(() => {
    const width = viewport.viewportWidth.value;
    const breakpoints = VIEWPORT_CONFIG.breakpoints;

    // Compact devices (320-374px): Scale down slightly
    if (width < breakpoints.mobile.min) {
      return width / 375;
    }

    // Mobile (375-767px): Base scale (1:1 with design)
    if (width < breakpoints.tablet.min) {
      return 1.0;
    }

    // Tablet (768-1023px): Scale up moderately
    if (width < breakpoints.desktop.min) {
      return 1.5;
    }

    // Desktop (1024px+): Scale up significantly but cap at 2x
    return Math.min(width / baseDimensions.width, 2.0);
  });

  /**
   * Scaled canvas dimensions maintaining aspect ratio
   */
  const canvasDimensions = computed(() => {
    const scale = uniformScale.value;
    return {
      width: Math.round(baseDimensions.width * scale),
      height: Math.round(baseDimensions.height * scale),
    };
  });

  /**
   * Scale a single value (e.g., radius, padding)
   * @param {number} value - Value to scale
   * @param {string} mode - Scaling mode: 'uniform' | 'adaptive' | 'x' | 'y'
   * @returns {number} - Scaled value
   */
  const scaleValue = (value, mode = 'adaptive') => {
    switch (mode) {
      case 'uniform':
        return value * uniformScale.value;
      case 'adaptive':
        return value * adaptiveScale.value;
      case 'x':
        return value * scaleX.value;
      case 'y':
        return value * scaleY.value;
      default:
        return value * adaptiveScale.value;
    }
  };

  /**
   * Scale a position object {x, y}
   * @param {object} position - Position to scale
   * @param {string} mode - Scaling mode
   * @returns {object} - Scaled position {x, y}
   */
  const scalePosition = (position, mode = 'adaptive') => {
    return {
      x: scaleValue(position.x, mode),
      y: scaleValue(position.y, mode),
    };
  };

  /**
   * Scale dimensions object {width, height}
   * @param {object} dimensions - Dimensions to scale
   * @param {string} mode - Scaling mode
   * @returns {object} - Scaled dimensions {width, height}
   */
  const scaleDimensions = (dimensions, mode = 'adaptive') => {
    return {
      width: scaleValue(dimensions.width, mode),
      height: scaleValue(dimensions.height, mode),
    };
  };

  /**
   * Get scaled canvas dimensions for rendering
   * Accounts for device pixel ratio for crisp rendering
   */
  const getCanvasDimensions = () => {
    const dpr = window.devicePixelRatio || 1;
    const dims = canvasDimensions.value;

    return {
      width: dims.width,
      height: dims.height,
      // Canvas internal resolution (for crisp rendering)
      internalWidth: Math.round(dims.width * dpr),
      internalHeight: Math.round(dims.height * dpr),
      devicePixelRatio: dpr,
    };
  };

  /**
   * Scale physics values (velocity, acceleration)
   * Physics should scale with adaptive scale to maintain feel
   * @param {number} physicsValue - Physics value to scale
   * @returns {number} - Scaled physics value
   */
  const scalePhysicsValue = (physicsValue) => {
    return physicsValue * adaptiveScale.value;
  };

  /**
   * Calculate responsive font size
   * @param {number} baseSize - Base font size in px
   * @returns {number} - Scaled font size
   */
  const scaleFontSize = (baseSize) => {
    const width = viewport.viewportWidth.value;

    // Compact: Slightly smaller
    if (width < 375) {
      return baseSize * 0.9;
    }

    // Mobile: Base size
    if (width < 768) {
      return baseSize;
    }

    // Tablet: Larger
    if (width < 1024) {
      return baseSize * 1.2;
    }

    // Desktop: Much larger
    return baseSize * 1.5;
  };

  return {
    // Raw scale factors
    scaleX,
    scaleY,
    uniformScale,
    adaptiveScale,

    // Scaled dimensions
    canvasDimensions,

    // Scaling utilities
    scaleValue,
    scalePosition,
    scaleDimensions,
    scalePhysicsValue,
    scaleFontSize,
    getCanvasDimensions,

    // Viewport info (re-exported for convenience)
    viewport,
  };
}
