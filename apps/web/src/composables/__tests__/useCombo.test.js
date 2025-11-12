import { describe, it, expect, beforeEach } from 'vitest';
import { useCombo } from '../useCombo.js';

describe('useCombo', () => {
  let comboInstance;

  beforeEach(() => {
    comboInstance = useCombo();
  });

  describe('Initial State', () => {
    it('should initialize with combo count of 0', () => {
      expect(comboInstance.combo.value).toBe(0);
    });

    it('should initialize with multiplier of 1.0', () => {
      expect(comboInstance.multiplier.value).toBe(1.0);
    });

    it('should not have any milestone initially', () => {
      expect(comboInstance.hasMilestone()).toBe(false);
    });
  });

  describe('incrementCombo', () => {
    it('should increment combo from 0 to 1', () => {
      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(1);
      expect(milestone).toBe(null);
    });

    it('should increment combo from 1 to 2', () => {
      comboInstance.incrementCombo();
      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(2);
      expect(milestone).toBe(null);
    });

    it('should increment combo from 4 to 5 and detect milestone', () => {
      // Increment to 4
      for (let i = 0; i < 4; i++) {
        comboInstance.incrementCombo();
      }
      // Increment to 5 (milestone)
      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(5);
      expect(milestone).toBe(5);
    });

    it('should increment combo from 9 to 10 and detect milestone', () => {
      // Increment to 9
      for (let i = 0; i < 9; i++) {
        comboInstance.incrementCombo();
      }
      // Increment to 10 (milestone)
      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(10);
      expect(milestone).toBe(10);
    });

    it('should increment combo from 14 to 15 and detect milestone', () => {
      // Increment to 14
      for (let i = 0; i < 14; i++) {
        comboInstance.incrementCombo();
      }
      // Increment to 15 (milestone)
      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(15);
      expect(milestone).toBe(15);
    });

    it('should increment combo from 19 to 20 and detect milestone', () => {
      // Increment to 19
      for (let i = 0; i < 19; i++) {
        comboInstance.incrementCombo();
      }
      // Increment to 20 (milestone)
      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(20);
      expect(milestone).toBe(20);
    });

    it('should not detect milestone at 6', () => {
      // Increment to 6
      for (let i = 0; i < 6; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.combo.value).toBe(6);
      expect(comboInstance.incrementCombo()).toBe(null);
    });

    it('should continue incrementing beyond 20', () => {
      // Increment to 25
      for (let i = 0; i < 25; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.combo.value).toBe(25);
    });
  });

  describe('resetCombo', () => {
    it('should reset combo from 5 to 0', () => {
      // Increment to 5
      for (let i = 0; i < 5; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.combo.value).toBe(5);

      comboInstance.resetCombo();
      expect(comboInstance.combo.value).toBe(0);
    });

    it('should reset multiplier from 1.2 to 1.0', () => {
      // Increment to 5 (1.2x multiplier)
      for (let i = 0; i < 5; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.multiplier.value).toBe(1.2);

      comboInstance.resetCombo();
      expect(comboInstance.multiplier.value).toBe(1.0);
    });

    it('should reset combo from 20 to 0', () => {
      // Increment to 20
      for (let i = 0; i < 20; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.combo.value).toBe(20);

      comboInstance.resetCombo();
      expect(comboInstance.combo.value).toBe(0);
      expect(comboInstance.multiplier.value).toBe(1.0);
    });
  });

  describe('getMultiplier', () => {
    it('should return 1.0 for combo 0', () => {
      expect(comboInstance.getMultiplier()).toBe(1.0);
    });

    it('should return 1.0 for combo 1-4', () => {
      for (let i = 0; i < 4; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.getMultiplier()).toBe(1.0);
    });

    it('should return 1.2 for combo 5-9', () => {
      for (let i = 0; i < 7; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.getMultiplier()).toBe(1.2);
    });

    it('should return 1.5 for combo 10-14', () => {
      for (let i = 0; i < 12; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.getMultiplier()).toBe(1.5);
    });

    it('should return 2.0 for combo 15-19', () => {
      for (let i = 0; i < 17; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.getMultiplier()).toBe(2.0);
    });

    it('should return 3.0 for combo 20+', () => {
      for (let i = 0; i < 25; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.getMultiplier()).toBe(3.0);
    });
  });

  describe('multiplier computed property', () => {
    it('should be reactive and update when combo changes', () => {
      expect(comboInstance.multiplier.value).toBe(1.0);

      // Increment to 5 (should change to 1.2x)
      for (let i = 0; i < 5; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.multiplier.value).toBe(1.2);

      // Increment to 10 (should change to 1.5x)
      for (let i = 0; i < 5; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.multiplier.value).toBe(1.5);

      // Reset (should go back to 1.0x)
      comboInstance.resetCombo();
      expect(comboInstance.multiplier.value).toBe(1.0);
    });
  });

  describe('hasMilestone', () => {
    it('should return false for combo < 5', () => {
      for (let i = 0; i < 4; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.hasMilestone()).toBe(false);
    });

    it('should return true for combo = 5', () => {
      for (let i = 0; i < 5; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.hasMilestone()).toBe(true);
    });

    it('should return true for combo = 10', () => {
      for (let i = 0; i < 10; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.hasMilestone()).toBe(true);
    });

    it('should return true for combo = 15', () => {
      for (let i = 0; i < 15; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.hasMilestone()).toBe(true);
    });

    it('should return true for combo = 20', () => {
      for (let i = 0; i < 20; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.hasMilestone()).toBe(true);
    });

    it('should return false for combo = 6', () => {
      for (let i = 0; i < 6; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.hasMilestone()).toBe(false);
    });

    it('should return false after reset', () => {
      for (let i = 0; i < 10; i++) {
        comboInstance.incrementCombo();
      }
      comboInstance.resetCombo();
      expect(comboInstance.hasMilestone()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple resets', () => {
      comboInstance.resetCombo();
      comboInstance.resetCombo();
      expect(comboInstance.combo.value).toBe(0);
      expect(comboInstance.multiplier.value).toBe(1.0);
    });

    it('should handle incrementing after reset', () => {
      for (let i = 0; i < 10; i++) {
        comboInstance.incrementCombo();
      }
      comboInstance.resetCombo();

      const milestone = comboInstance.incrementCombo();
      expect(comboInstance.combo.value).toBe(1);
      expect(milestone).toBe(null);
      expect(comboInstance.multiplier.value).toBe(1.0);
    });

    it('should handle very high combo counts', () => {
      for (let i = 0; i < 100; i++) {
        comboInstance.incrementCombo();
      }
      expect(comboInstance.combo.value).toBe(100);
      expect(comboInstance.multiplier.value).toBe(3.0); // Max multiplier
    });
  });

  describe('Integration Scenarios', () => {
    it('should correctly track combo streak with mixed hits', () => {
      // Simulate game scenario: 3 hits, miss, 5 hits
      comboInstance.incrementCombo(); // 1
      comboInstance.incrementCombo(); // 2
      comboInstance.incrementCombo(); // 3
      expect(comboInstance.combo.value).toBe(3);

      comboInstance.resetCombo(); // Miss
      expect(comboInstance.combo.value).toBe(0);

      comboInstance.incrementCombo(); // 1
      comboInstance.incrementCombo(); // 2
      comboInstance.incrementCombo(); // 3
      comboInstance.incrementCombo(); // 4
      const milestone = comboInstance.incrementCombo(); // 5 - milestone
      expect(comboInstance.combo.value).toBe(5);
      expect(milestone).toBe(5);
      expect(comboInstance.multiplier.value).toBe(1.2);
    });

    it('should correctly track milestones in sequence', () => {
      const milestones = [];

      for (let i = 1; i <= 25; i++) {
        const milestone = comboInstance.incrementCombo();
        if (milestone !== null) {
          milestones.push(milestone);
        }
      }

      expect(milestones).toEqual([5, 10, 15, 20]);
    });

    it('should maintain consistent state across operations', () => {
      // Build to milestone
      for (let i = 0; i < 10; i++) {
        comboInstance.incrementCombo();
      }

      const combo1 = comboInstance.combo.value;
      const multiplier1 = comboInstance.multiplier.value;
      const hasMilestone1 = comboInstance.hasMilestone();

      // Values should be consistent
      expect(combo1).toBe(10);
      expect(multiplier1).toBe(1.5);
      expect(hasMilestone1).toBe(true);
      expect(comboInstance.getMultiplier()).toBe(multiplier1);
    });
  });
});
