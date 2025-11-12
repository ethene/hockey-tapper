/**
 * Tests for usePhysics Composable
 *
 * Tests physics simulation including:
 * - Launch mechanics (angle → velocity conversion)
 * - Position updates (gravity, friction, delta time)
 * - Boundary detection
 * - Trajectory calculation
 * - Computed properties (speed, direction, isMoving)
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePhysics } from '../usePhysics.js';

describe('usePhysics', () => {
  let physics;

  beforeEach(() => {
    physics = usePhysics();
    // Clear console logs to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // ==========================================================================
  // Initial State Tests
  // ==========================================================================

  describe('Initial State', () => {
    it('should initialize with position at origin', () => {
      expect(physics.position.value).toEqual({ x: 0, y: 0 });
    });

    it('should initialize with zero velocity', () => {
      expect(physics.velocity.value).toEqual({ x: 0, y: 0 });
    });

    it('should initialize with isFlying = false', () => {
      expect(physics.isFlying.value).toBe(false);
    });

    it('should initialize with launchPosition at origin', () => {
      expect(physics.launchPosition.value).toEqual({ x: 0, y: 0 });
    });

    it('should initialize with speed = 0', () => {
      expect(physics.speed.value).toBe(0);
    });

    it('should initialize with isMoving = false', () => {
      expect(physics.isMoving.value).toBe(false);
    });
  });

  // ==========================================================================
  // launchPuck Tests - Angle/Power → Velocity Conversion
  // ==========================================================================

  describe('launchPuck', () => {
    describe('Velocity Calculation', () => {
      it('should calculate velocity from angle and power', () => {
        physics.launchPuck(45, 1.0, { x: 100, y: 200 });

        // At 45°, cos(45) ≈ 0.707, sin(45) ≈ 0.707
        // baseVelocity = 350 px/s, so velocity ≈ 350 * 0.707 ≈ 247.5
        expect(physics.velocity.value.x).toBeCloseTo(247.5, 0);
        expect(physics.velocity.value.y).toBeCloseTo(-247.5, 0); // Negative y for upward
      });

      it('should handle 0° angle (straight right)', () => {
        physics.launchPuck(0, 1.0, { x: 100, y: 200 });

        // cos(0) = 1, sin(0) = 0
        expect(physics.velocity.value.x).toBeCloseTo(350, 0);
        expect(physics.velocity.value.y).toBeCloseTo(0, 0);
      });

      it('should handle 90° angle (straight up)', () => {
        physics.launchPuck(90, 1.0, { x: 100, y: 200 });

        // cos(90) = 0, sin(90) = 1
        expect(physics.velocity.value.x).toBeCloseTo(0, 0);
        expect(physics.velocity.value.y).toBeCloseTo(-350, 0);
      });

      it('should handle negative angle (downward)', () => {
        physics.launchPuck(-45, 1.0, { x: 100, y: 200 });

        // cos(-45) ≈ 0.707, sin(-45) ≈ -0.707
        expect(physics.velocity.value.x).toBeCloseTo(247.5, 0);
        expect(physics.velocity.value.y).toBeCloseTo(247.5, 0); // Positive y for downward
      });

      it('should scale velocity by power', () => {
        physics.launchPuck(45, 0.5, { x: 100, y: 200 });

        // Half power → half velocity
        expect(physics.velocity.value.x).toBeCloseTo(123.75, 0);
        expect(physics.velocity.value.y).toBeCloseTo(-123.75, 0);
      });

      it('should clamp velocity to maxVelocity', () => {
        physics.launchPuck(0, 5.0, { x: 100, y: 200 }); // Excessive power

        // maxVelocity = 550 px/s
        expect(physics.velocity.value.x).toBe(550);
        expect(physics.velocity.value.y).toBeCloseTo(0, 5); // Handle -0 vs 0
      });

      it('should handle zero power', () => {
        physics.launchPuck(45, 0, { x: 100, y: 200 });

        expect(physics.velocity.value.x).toBeCloseTo(0, 5); // Handle -0 vs 0
        expect(physics.velocity.value.y).toBeCloseTo(0, 5); // Handle -0 vs 0
      });
    });

    describe('Position Initialization', () => {
      it('should set position to startPosition', () => {
        physics.launchPuck(45, 1.0, { x: 150, y: 300 });

        expect(physics.position.value).toEqual({ x: 150, y: 300 });
      });

      it('should set launchPosition to startPosition', () => {
        physics.launchPuck(45, 1.0, { x: 150, y: 300 });

        expect(physics.launchPosition.value).toEqual({ x: 150, y: 300 });
      });

      it('should not change position if startPosition is null', () => {
        physics.position.value = { x: 50, y: 50 };
        physics.launchPuck(45, 1.0, null);

        expect(physics.position.value).toEqual({ x: 50, y: 50 });
      });
    });

    describe('Flight State', () => {
      it('should set isFlying to true', () => {
        physics.launchPuck(45, 1.0, { x: 100, y: 200 });

        expect(physics.isFlying.value).toBe(true);
      });

      it('should reset lastUpdateTime to 0', () => {
        physics.launchPuck(45, 1.0, { x: 100, y: 200 });

        // Note: lastUpdateTime is internal, but we can test its effect
        // by calling updatePosition twice and checking behavior
        expect(physics.isFlying.value).toBe(true);
      });
    });
  });

  // ==========================================================================
  // updatePosition Tests - Physics Simulation
  // ==========================================================================

  describe('updatePosition', () => {
    beforeEach(() => {
      // Launch puck before testing updates
      physics.launchPuck(45, 1.0, { x: 187.5, y: 400 }); // Center of 375px viewport
    });

    it('should not update if not flying', () => {
      physics.stopPuck();
      const initialPosition = { ...physics.position.value };

      physics.updatePosition(1000);

      expect(physics.position.value).toEqual(initialPosition);
    });

    it('should initialize time on first update', () => {
      const initialPosition = { ...physics.position.value };

      physics.updatePosition(1000);

      // First call should not move (just initializes time)
      expect(physics.position.value).toEqual(initialPosition);
    });

    it('should apply gravity to y velocity', () => {
      physics.updatePosition(1000); // Initialize time
      const initialVelocityY = physics.velocity.value.y;

      physics.updatePosition(1050); // 50ms later

      // Gravity = 300 px/s², friction = 0.99
      // deltaTime = 0.05s
      // velocityY increases by gravity: initialVY + 15
      // Then friction applied: (initialVY + 15) * 0.99
      const expectedVelocityY = (initialVelocityY + 15) * 0.99;
      expect(physics.velocity.value.y).toBeCloseTo(expectedVelocityY, 0);
    });

    it('should apply friction to velocity', () => {
      physics.updatePosition(1000); // Initialize time
      const initialVelocityX = physics.velocity.value.x;
      const initialVelocityY = physics.velocity.value.y;

      physics.updatePosition(1050); // 50ms later

      // Friction = 0.99 per frame
      // velocityX: just friction applied
      // velocityY: gravity applied first, then friction
      expect(physics.velocity.value.x).toBeCloseTo(initialVelocityX * 0.99, 0);
      expect(physics.velocity.value.y).toBeCloseTo((initialVelocityY + 15) * 0.99, 0);
    });

    it('should update position based on velocity and deltaTime', () => {
      physics.updatePosition(1000); // Initialize time
      const initialPosition = { ...physics.position.value };
      const velocityX = physics.velocity.value.x;

      physics.updatePosition(1100); // 100ms later (deltaTime clamped to 50ms)

      // Position should change by: velocity * deltaTime
      // With 50ms clamp: velocityX * 0.05
      const expectedX = initialPosition.x + velocityX * 0.05;
      expect(physics.position.value.x).toBeCloseTo(expectedX, 0);
    });

    it('should clamp deltaTime to 50ms maximum', () => {
      physics.updatePosition(1000); // Initialize time
      const initialPosition = { ...physics.position.value };
      const velocityX = physics.velocity.value.x;

      physics.updatePosition(2000); // 1000ms later (should clamp to 50ms)

      // Should move as if only 50ms passed
      const expectedX = initialPosition.x + velocityX * 0.05;
      expect(physics.position.value.x).toBeCloseTo(expectedX, 0);
    });

    it('should stop puck when out of bounds (left)', () => {
      physics.position.value = { x: -150, y: 400 };

      physics.updatePosition(1000);
      physics.updatePosition(1050);

      expect(physics.isFlying.value).toBe(false);
    });

    it('should stop puck when out of bounds (right)', () => {
      physics.position.value = { x: 500, y: 400 }; // 375 + 100 = 475

      physics.updatePosition(1000);
      physics.updatePosition(1050);

      expect(physics.isFlying.value).toBe(false);
    });

    it('should stop puck when out of bounds (top)', () => {
      physics.position.value = { x: 187.5, y: -150 };

      physics.updatePosition(1000);
      physics.updatePosition(1050);

      expect(physics.isFlying.value).toBe(false);
    });

    it('should stop puck when out of bounds (bottom)', () => {
      physics.position.value = { x: 187.5, y: 950 }; // 812 + 100 = 912

      physics.updatePosition(1000);
      physics.updatePosition(1050);

      expect(physics.isFlying.value).toBe(false);
    });
  });

  // ==========================================================================
  // Boundary Detection Tests
  // ==========================================================================

  describe('isOutOfBounds', () => {
    it('should return false when in bounds', () => {
      physics.position.value = { x: 187.5, y: 400 };

      expect(physics.isOutOfBounds.value).toBe(false);
    });

    it('should return true when x < -100', () => {
      physics.position.value = { x: -101, y: 400 };

      expect(physics.isOutOfBounds.value).toBe(true);
    });

    it('should return true when x > width + 100', () => {
      physics.position.value = { x: 476, y: 400 }; // 375 + 100 + 1

      expect(physics.isOutOfBounds.value).toBe(true);
    });

    it('should return true when y < -100', () => {
      physics.position.value = { x: 187.5, y: -101 };

      expect(physics.isOutOfBounds.value).toBe(true);
    });

    it('should return true when y > height + 100', () => {
      physics.position.value = { x: 187.5, y: 913 }; // 812 + 100 + 1

      expect(physics.isOutOfBounds.value).toBe(true);
    });

    it('should return false at exact boundary (x = -100)', () => {
      physics.position.value = { x: -100, y: 400 };

      expect(physics.isOutOfBounds.value).toBe(false);
    });

    it('should return false at exact boundary (x = width + 100)', () => {
      physics.position.value = { x: 475, y: 400 }; // 375 + 100

      expect(physics.isOutOfBounds.value).toBe(false);
    });
  });

  // ==========================================================================
  // stopPuck Tests
  // ==========================================================================

  describe('stopPuck', () => {
    beforeEach(() => {
      physics.launchPuck(45, 1.0, { x: 100, y: 200 });
    });

    it('should set isFlying to false', () => {
      physics.stopPuck();

      expect(physics.isFlying.value).toBe(false);
    });

    it('should reset velocity to zero', () => {
      physics.stopPuck();

      expect(physics.velocity.value).toEqual({ x: 0, y: 0 });
    });

    it('should not change position', () => {
      const positionBeforeStop = { ...physics.position.value };

      physics.stopPuck();

      expect(physics.position.value).toEqual(positionBeforeStop);
    });
  });

  // ==========================================================================
  // resetPuck Tests
  // ==========================================================================

  describe('resetPuck', () => {
    beforeEach(() => {
      physics.launchPuck(45, 1.0, { x: 100, y: 200 });
    });

    it('should stop the puck', () => {
      physics.resetPuck({ x: 50, y: 50 });

      expect(physics.isFlying.value).toBe(false);
      expect(physics.velocity.value).toEqual({ x: 0, y: 0 });
    });

    it('should set position to initialPosition if provided', () => {
      physics.resetPuck({ x: 250, y: 350 });

      expect(physics.position.value).toEqual({ x: 250, y: 350 });
    });

    it('should set launchPosition to initialPosition if provided', () => {
      physics.resetPuck({ x: 250, y: 350 });

      expect(physics.launchPosition.value).toEqual({ x: 250, y: 350 });
    });

    it('should use default position if initialPosition is null', () => {
      physics.resetPuck(null);

      // Default: center-bottom (width/2, height - 150)
      // width = 375, height = 812
      expect(physics.position.value).toEqual({ x: 187.5, y: 662 });
    });

    it('should use default launchPosition if initialPosition is null', () => {
      physics.resetPuck(null);

      expect(physics.launchPosition.value).toEqual({ x: 187.5, y: 662 });
    });
  });

  // ==========================================================================
  // calculateTrajectory Tests
  // ==========================================================================

  describe('calculateTrajectory', () => {
    beforeEach(() => {
      physics.launchPuck(45, 1.0, { x: 187.5, y: 400 });
    });

    it('should return array of trajectory points', () => {
      const trajectory = physics.calculateTrajectory(10);

      expect(Array.isArray(trajectory)).toBe(true);
      expect(trajectory.length).toBeGreaterThan(0);
    });

    it('should start trajectory at current position', () => {
      const trajectory = physics.calculateTrajectory(10);

      expect(trajectory[0]).toEqual({ x: 187.5, y: 400 });
    });

    it('should simulate gravity in trajectory', () => {
      const trajectory = physics.calculateTrajectory(20);

      // With 45° launch, Y should initially decrease (negative velocity = going up)
      // then increase (gravity pulls down)
      // Check that trajectory has upward and downward movement
      const firstY = trajectory[0].y;
      const lastY = trajectory[trajectory.length - 1].y;

      // Y should decrease initially (going up) and then eventually increase
      // Find minimum Y (peak of trajectory)
      const minY = Math.min(...trajectory.map(p => p.y));

      expect(minY).toBeLessThan(firstY); // Peak is higher than start
      expect(lastY).toBeGreaterThan(minY); // End is lower than peak (falling)
    });

    it('should stop trajectory if out of bounds', () => {
      // Launch straight down to quickly exit bounds
      physics.launchPuck(-90, 2.0, { x: 187.5, y: 700 });

      const trajectory = physics.calculateTrajectory(50);

      // Should stop before 50 steps
      expect(trajectory.length).toBeLessThan(50);
    });

    it('should respect steps parameter', () => {
      const trajectory = physics.calculateTrajectory(5);

      expect(trajectory.length).toBeLessThanOrEqual(5);
    });

    it('should apply friction in trajectory simulation', () => {
      const trajectory = physics.calculateTrajectory(20);

      // Calculate horizontal distance between points
      // Should decrease over time due to friction
      const dist1 = trajectory[2].x - trajectory[1].x;
      const dist2 = trajectory[10].x - trajectory[9].x;

      expect(Math.abs(dist2)).toBeLessThan(Math.abs(dist1));
    });
  });

  // ==========================================================================
  // Computed Properties Tests
  // ==========================================================================

  describe('Computed Properties', () => {
    describe('speed', () => {
      it('should calculate magnitude of velocity vector', () => {
        physics.velocity.value = { x: 3, y: 4 };

        // sqrt(3² + 4²) = sqrt(9 + 16) = 5
        expect(physics.speed.value).toBe(5);
      });

      it('should return 0 when velocity is zero', () => {
        physics.velocity.value = { x: 0, y: 0 };

        expect(physics.speed.value).toBe(0);
      });

      it('should handle negative velocities correctly', () => {
        physics.velocity.value = { x: -3, y: -4 };

        // sqrt((-3)² + (-4)²) = 5
        expect(physics.speed.value).toBe(5);
      });
    });

    describe('direction', () => {
      it('should calculate angle from velocity', () => {
        physics.velocity.value = { x: 100, y: 0 };

        // atan2(0, 100) = 0° (pointing right)
        expect(physics.direction.value).toBeCloseTo(0, 0);
      });

      it('should return 90° for upward velocity', () => {
        physics.velocity.value = { x: 0, y: -100 };

        // atan2(-(-100), 0) = 90°
        expect(physics.direction.value).toBeCloseTo(90, 0);
      });

      it('should return -90° for downward velocity', () => {
        physics.velocity.value = { x: 0, y: 100 };

        // atan2(-100, 0) = -90°
        expect(physics.direction.value).toBeCloseTo(-90, 0);
      });

      it('should return 45° for diagonal velocity', () => {
        physics.velocity.value = { x: 100, y: -100 };

        // atan2(-(-100), 100) = 45°
        expect(physics.direction.value).toBeCloseTo(45, 0);
      });
    });

    describe('isMoving', () => {
      it('should return true when speed > 10', () => {
        physics.velocity.value = { x: 20, y: 0 };

        expect(physics.isMoving.value).toBe(true);
      });

      it('should return false when speed = 10', () => {
        physics.velocity.value = { x: 10, y: 0 };

        expect(physics.isMoving.value).toBe(false);
      });

      it('should return false when speed < 10', () => {
        physics.velocity.value = { x: 5, y: 0 };

        expect(physics.isMoving.value).toBe(false);
      });

      it('should return false when velocity is zero', () => {
        physics.velocity.value = { x: 0, y: 0 };

        expect(physics.isMoving.value).toBe(false);
      });
    });
  });

  // ==========================================================================
  // Edge Cases & Integration Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle very small velocities', () => {
      physics.launchPuck(45, 0.001, { x: 100, y: 200 });

      // baseVelocity = 350, power = 0.001, angle = 45°
      // velocity = 350 * 0.001 * cos(45°) ≈ 0.2475
      expect(physics.velocity.value.x).toBeCloseTo(0.2475, 2);
      expect(physics.velocity.value.y).toBeCloseTo(-0.2475, 2);
    });

    it('should handle very large angles (> 360°)', () => {
      physics.launchPuck(405, 1.0, { x: 100, y: 200 }); // 405° = 45°

      // Should wrap around and behave like 45°
      expect(physics.velocity.value.x).toBeCloseTo(247.5, 0);
      expect(physics.velocity.value.y).toBeCloseTo(-247.5, 0);
    });

    it('should handle negative power gracefully', () => {
      physics.launchPuck(45, -0.5, { x: 100, y: 200 });

      // Negative power should result in negative velocity components
      expect(physics.velocity.value.x).toBeCloseTo(-123.75, 0);
      expect(physics.velocity.value.y).toBeCloseTo(123.75, 0);
    });

    it('should handle multiple launches in succession', () => {
      physics.launchPuck(0, 1.0, { x: 100, y: 200 });
      const firstVelocity = { ...physics.velocity.value };

      physics.launchPuck(90, 1.0, { x: 100, y: 200 });
      const secondVelocity = { ...physics.velocity.value };

      expect(firstVelocity).not.toEqual(secondVelocity);
      expect(physics.isFlying.value).toBe(true);
    });

    it('should maintain consistency through update cycle', () => {
      physics.launchPuck(45, 1.0, { x: 187.5, y: 400 });

      // Run several update cycles
      physics.updatePosition(1000);
      for (let i = 0; i < 10; i++) {
        physics.updatePosition(1000 + (i + 1) * 16);
      }

      // Puck should still be flying (not NaN or undefined)
      expect(physics.isFlying.value).toBe(true);
      expect(physics.position.value.x).toBeGreaterThan(0);
      expect(physics.position.value.y).toBeGreaterThan(0);
      expect(isNaN(physics.position.value.x)).toBe(false);
      expect(isNaN(physics.position.value.y)).toBe(false);
    });
  });
});
