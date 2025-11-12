/**
 * Combo System Composable for Hockey Tapper
 *
 * Manages combo count and multiplier for consecutive successful hits.
 * Detects milestones at 5, 10, 15, and 20 hits for enhanced rewards.
 *
 * Multiplier Tiers:
 * - 0-4 hits: 1.0x (no bonus)
 * - 5-9 hits: 1.2x (20% bonus)
 * - 10-14 hits: 1.5x (50% bonus)
 * - 15-19 hits: 2.0x (100% bonus)
 * - 20+ hits: 3.0x (200% bonus)
 *
 * Usage:
 * const { combo, multiplier, incrementCombo, resetCombo } = useCombo()
 *
 * // On successful hit
 * const milestone = incrementCombo()
 * if (milestone) {
 *   // Trigger special effects for milestone
 * }
 *
 * // On miss
 * resetCombo()
 */

import { ref, computed } from 'vue';

// Combo milestones (trigger special effects)
const MILESTONES = [5, 10, 15, 20];

// Multiplier mapping based on combo count
const MULTIPLIER_TIERS = [
  { min: 20, multiplier: 3.0 },
  { min: 15, multiplier: 2.0 },
  { min: 10, multiplier: 1.5 },
  { min: 5, multiplier: 1.2 },
  { min: 0, multiplier: 1.0 },
];

/**
 * Combo composable
 */
export const useCombo = () => {
  // State
  const combo = ref(0);

  /**
   * Computed multiplier based on current combo count
   */
  const multiplier = computed(() => {
    return getMultiplier();
  });

  /**
   * Increment combo count
   * @returns {number|null} - Returns milestone value if reached, null otherwise
   */
  const incrementCombo = () => {
    combo.value++;

    // Check if current combo is a milestone
    if (MILESTONES.includes(combo.value)) {
      return combo.value;
    }

    return null;
  };

  /**
   * Reset combo count to zero
   */
  const resetCombo = () => {
    combo.value = 0;
  };

  /**
   * Get multiplier for current combo count
   * @returns {number} - Current multiplier (1.0, 1.2, 1.5, 2.0, or 3.0)
   */
  const getMultiplier = () => {
    for (const tier of MULTIPLIER_TIERS) {
      if (combo.value >= tier.min) {
        return tier.multiplier;
      }
    }
    return 1.0; // Fallback (should never reach here)
  };

  /**
   * Check if current combo is a milestone
   * @returns {boolean} - True if current combo is a milestone
   */
  const hasMilestone = () => {
    return MILESTONES.includes(combo.value);
  };

  return {
    // State
    combo,
    multiplier,

    // Methods
    incrementCombo,
    resetCombo,
    getMultiplier,
    hasMilestone,
  };
};

export default useCombo;
