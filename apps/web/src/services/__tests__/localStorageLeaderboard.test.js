/**
 * Tests for localStorageLeaderboard Service
 *
 * Tests localStorage-based leaderboard including:
 * - Score persistence and sorting
 * - Top 100 enforcement
 * - Leaderboard retrieval
 * - User score filtering
 * - Statistics calculation
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveScoreLocal,
  getLeaderboard,
  getUserScores,
  clearLeaderboard,
  getStats,
  isLocalStorageAvailable,
} from '../localStorageLeaderboard.js';

describe('localStorageLeaderboard', () => {
  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ==========================================================================
  // saveScoreLocal Tests
  // ==========================================================================

  describe('saveScoreLocal', () => {
    it('should save score to localStorage', async () => {
      const result = await saveScoreLocal(1000, 'TestUser');

      expect(result.message).toBe('Score saved successfully');
      expect(result.data.score).toBe(1000);
      expect(result.data.username).toBe('TestUser');
    });

    it('should generate unique ID for each score', async () => {
      const result1 = await saveScoreLocal(100, 'User1');
      const result2 = await saveScoreLocal(200, 'User2');

      expect(result1.data.id).toBeTruthy();
      expect(result2.data.id).toBeTruthy();
      expect(result1.data.id).not.toBe(result2.data.id);
    });

    it('should add timestamp to score', async () => {
      const before = Date.now();
      const result = await saveScoreLocal(500, 'User');
      const after = Date.now();

      expect(result.data.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.data.timestamp).toBeLessThanOrEqual(after);
    });

    it('should sort scores by score descending', async () => {
      await saveScoreLocal(100, 'User1');
      await saveScoreLocal(300, 'User2');
      await saveScoreLocal(200, 'User3');

      const leaderboard = await getLeaderboard(10);

      expect(leaderboard.data[0].score).toBe(300);
      expect(leaderboard.data[1].score).toBe(200);
      expect(leaderboard.data[2].score).toBe(100);
    });

    it('should sort equal scores by timestamp ascending (oldest first)', async () => {
      await saveScoreLocal(100, 'First');
      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamp
      await saveScoreLocal(100, 'Second');

      const leaderboard = await getLeaderboard(10);

      expect(leaderboard.data[0].username).toBe('First'); // Older timestamp
      expect(leaderboard.data[1].username).toBe('Second');
    });

    it('should enforce top 100 limit', async () => {
      // Add 105 scores
      for (let i = 0; i < 105; i++) {
        await saveScoreLocal(i, `User${i}`);
      }

      const leaderboard = await getLeaderboard(150);

      expect(leaderboard.data.length).toBe(100); // Only top 100 kept
    }, 10000); // 10s timeout

    it('should keep highest 100 scores when limit exceeded', async () => {
      // Add 105 scores (0-104)
      for (let i = 0; i < 105; i++) {
        await saveScoreLocal(i, `User${i}`);
      }

      const leaderboard = await getLeaderboard(150);

      // Should keep scores 104 down to 5 (top 100)
      expect(leaderboard.data[0].score).toBe(104);
      expect(leaderboard.data[99].score).toBe(5);
    }, 10000); // 10s timeout

    it('should use default username if not provided', async () => {
      const result = await saveScoreLocal(500);

      expect(result.data.username).toBe('Player');
    });

    it('should sanitize username (trim whitespace)', async () => {
      const result = await saveScoreLocal(500, '  TestUser  ');

      expect(result.data.username).toBe('TestUser');
    });

    it('should use "Player" for empty username', async () => {
      const result = await saveScoreLocal(500, '   ');

      expect(result.data.username).toBe('Player');
    });

    it('should reject negative scores', async () => {
      await expect(saveScoreLocal(-100, 'User')).rejects.toThrow('Invalid score: must be a non-negative number');
    });

    it('should reject non-numeric scores', async () => {
      await expect(saveScoreLocal('abc', 'User')).rejects.toThrow('Invalid score: must be a non-negative number');
    });

    it('should reject non-integer scores', async () => {
      await expect(saveScoreLocal(123.45, 'User')).rejects.toThrow('Invalid score: must be an integer');
    });

    it('should accept zero score', async () => {
      const result = await saveScoreLocal(0, 'User');

      expect(result.data.score).toBe(0);
    });
  });

  // ==========================================================================
  // getLeaderboard Tests
  // ==========================================================================

  describe('getLeaderboard', () => {
    beforeEach(async () => {
      // Add test data
      await saveScoreLocal(300, 'User1');
      await saveScoreLocal(200, 'User2');
      await saveScoreLocal(100, 'User3');
    });

    it('should return top N scores', async () => {
      const result = await getLeaderboard(2);

      expect(result.data.length).toBe(2);
      expect(result.data[0].score).toBe(300);
      expect(result.data[1].score).toBe(200);
    });

    it('should default to 20 scores if no limit', async () => {
      const result = await getLeaderboard();

      expect(result.data.length).toBeLessThanOrEqual(20);
      expect(result.count).toBe(3); // Only 3 scores in test data
    });

    it('should clamp limit to 100 maximum', async () => {
      const result = await getLeaderboard(500);

      expect(result.data.length).toBeLessThanOrEqual(100);
    });

    it('should clamp limit to 1 minimum', async () => {
      const result = await getLeaderboard(0);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.data.length).toBeLessThanOrEqual(3); // 3 scores in test data
    });

    it('should return empty array for empty leaderboard', async () => {
      await clearLeaderboard();

      const result = await getLeaderboard();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should return count matching data length', async () => {
      const result = await getLeaderboard(2);

      expect(result.count).toBe(result.data.length);
    });
  });

  // ==========================================================================
  // getUserScores Tests
  // ==========================================================================

  describe('getUserScores', () => {
    beforeEach(async () => {
      await saveScoreLocal(300, 'Alice');
      await saveScoreLocal(250, 'Bob');
      await saveScoreLocal(200, 'Alice');
      await saveScoreLocal(150, 'Bob');
      await saveScoreLocal(100, 'Alice');
    });

    it('should return only scores for specified user', async () => {
      const result = await getUserScores('Alice');

      expect(result.data.length).toBe(3);
      expect(result.data.every(s => s.username === 'Alice')).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const result = await getUserScores('alice'); // lowercase

      expect(result.data.length).toBe(3);
      expect(result.data.every(s => s.username === 'Alice')).toBe(true);
    });

    it('should return scores in sorted order (highest first)', async () => {
      const result = await getUserScores('Alice');

      expect(result.data[0].score).toBe(300);
      expect(result.data[1].score).toBe(200);
      expect(result.data[2].score).toBe(100);
    });

    it('should respect limit parameter', async () => {
      const result = await getUserScores('Alice', 2);

      expect(result.data.length).toBe(2);
    });

    it('should default to limit 10', async () => {
      const result = await getUserScores('Alice');

      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should clamp limit to 50 maximum', async () => {
      const result = await getUserScores('Alice', 100);

      expect(result.data.length).toBeLessThanOrEqual(50);
    });

    it('should return empty array for non-existent user', async () => {
      const result = await getUserScores('NonExistent');

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should return username in response', async () => {
      const result = await getUserScores('Alice');

      expect(result.username).toBe('Alice');
    });
  });

  // ==========================================================================
  // clearLeaderboard Tests
  // ==========================================================================

  describe('clearLeaderboard', () => {
    it('should remove all scores from localStorage', async () => {
      await saveScoreLocal(100, 'User1');
      await saveScoreLocal(200, 'User2');

      await clearLeaderboard();

      const leaderboard = await getLeaderboard();
      expect(leaderboard.data).toEqual([]);
    });

    it('should return success message', async () => {
      const result = await clearLeaderboard();

      expect(result.message).toBe('Leaderboard cleared successfully');
    });

    it('should not throw if already empty', async () => {
      await clearLeaderboard();

      await expect(clearLeaderboard()).resolves.toBeDefined();
    });
  });

  // ==========================================================================
  // getStats Tests
  // ==========================================================================

  describe('getStats', () => {
    it('should return zero stats for empty leaderboard', async () => {
      const stats = await getStats();

      expect(stats).toEqual({
        totalGames: 0,
        averageScore: 0,
        highScore: 0,
        lowScore: 0,
      });
    });

    it('should calculate total games correctly', async () => {
      await saveScoreLocal(100, 'User1');
      await saveScoreLocal(200, 'User2');
      await saveScoreLocal(300, 'User3');

      const stats = await getStats();

      expect(stats.totalGames).toBe(3);
    });

    it('should calculate average score correctly', async () => {
      await saveScoreLocal(100, 'User1');
      await saveScoreLocal(200, 'User2');
      await saveScoreLocal(300, 'User3');

      const stats = await getStats();

      expect(stats.averageScore).toBe(200); // (100 + 200 + 300) / 3 = 200
    });

    it('should round average score to integer', async () => {
      await saveScoreLocal(100, 'User1');
      await saveScoreLocal(100, 'User2');
      await saveScoreLocal(101, 'User3');

      const stats = await getStats();

      expect(Number.isInteger(stats.averageScore)).toBe(true);
    });

    it('should find high score correctly', async () => {
      await saveScoreLocal(100, 'User1');
      await saveScoreLocal(300, 'User2');
      await saveScoreLocal(200, 'User3');

      const stats = await getStats();

      expect(stats.highScore).toBe(300);
    });

    it('should find low score correctly', async () => {
      await saveScoreLocal(200, 'User1');
      await saveScoreLocal(300, 'User2');
      await saveScoreLocal(100, 'User3');

      const stats = await getStats();

      expect(stats.lowScore).toBe(100);
    });
  });

  // ==========================================================================
  // isLocalStorageAvailable Tests
  // ==========================================================================

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      const result = isLocalStorageAvailable();

      Storage.prototype.setItem = originalSetItem;
      expect(result).toBe(false);
    });
  });

  // ==========================================================================
  // Edge Cases & Integration Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      // Manually corrupt data
      localStorage.setItem('hockey_tapper_scores', 'invalid json{');

      const leaderboard = await getLeaderboard();

      expect(leaderboard.data).toEqual([]);
    });

    it('should handle localStorage quota exceeded', async () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      await expect(saveScoreLocal(100, 'User')).rejects.toThrow('Failed to save scores');

      Storage.prototype.setItem = originalSetItem;
    });

    it('should maintain data integrity across multiple operations', async () => {
      // Perform multiple operations
      await saveScoreLocal(100, 'User1');
      await getLeaderboard();
      await saveScoreLocal(200, 'User2');
      await getUserScores('User1');
      await saveScoreLocal(150, 'User1');

      const stats = await getStats();
      const leaderboard = await getLeaderboard();

      expect(stats.totalGames).toBe(3);
      expect(leaderboard.data.length).toBe(3);
      expect(leaderboard.data[0].score).toBe(200);
    });

    it('should handle very large score values', async () => {
      const largeScore = 999999999;
      const result = await saveScoreLocal(largeScore, 'User');

      expect(result.data.score).toBe(largeScore);
    });

    it('should handle special characters in username', async () => {
      const result = await saveScoreLocal(100, 'User™️🎮');

      expect(result.data.username).toBe('User™️🎮');
    });
  });
});
