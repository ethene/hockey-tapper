import axios from 'axios';
import * as localStorageLeaderboard from './localStorageLeaderboard.js';

// Demo mode: Use localStorage if no backend URL is configured
const DEMO_MODE = !import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Log mode on initialization
console.log(
  `🎮 API Mode: ${DEMO_MODE ? 'DEMO (localStorage)' : 'BACKEND (API)'}`
);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Save a score to the server or localStorage
 * @param {number} score - The score to save
 * @param {string} [userId] - Optional user ID (or username in demo mode)
 * @returns {Promise<object>} Response data
 */
export async function saveScore(score, userId = null) {
  try {
    // Demo mode: Use localStorage
    if (DEMO_MODE) {
      console.log('[DEMO] Saving score to localStorage:', score);
      return await localStorageLeaderboard.saveScoreLocal(score, userId || 'Player');
    }

    // Production mode: Use API
    const response = await apiClient.post('/score', {
      score,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to save score:', error);
    throw error;
  }
}

/**
 * Fetch the leaderboard
 * @param {number} [limit=20] - Number of top scores to fetch
 * @returns {Promise<Array>} Leaderboard data
 */
export async function getLeaderboard(limit = 20) {
  try {
    // Demo mode: Use localStorage
    if (DEMO_MODE) {
      console.log('[DEMO] Fetching leaderboard from localStorage');
      const response = await localStorageLeaderboard.getLeaderboard(limit);
      return response.data || [];
    }

    // Production mode: Use API
    const response = await apiClient.get('/leaderboard', {
      params: { limit },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw error;
  }
}

/**
 * Get user's score history
 * @param {string} userId - User ID (or username in demo mode)
 * @param {number} [limit=10] - Number of recent scores to fetch
 * @returns {Promise<Array>} User score history
 */
export async function getUserScores(userId, limit = 10) {
  try {
    // Demo mode: Use localStorage
    if (DEMO_MODE) {
      console.log('[DEMO] Fetching user scores from localStorage:', userId);
      const response = await localStorageLeaderboard.getUserScores(userId, limit);
      return response.data || [];
    }

    // Production mode: Use API
    const response = await apiClient.get(`/score/${userId}`, {
      params: { limit },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch user scores:', error);
    throw error;
  }
}

/**
 * Health check
 * @returns {Promise<object>} Server health status
 */
export async function checkHealth() {
  try {
    // Demo mode: Always return healthy
    if (DEMO_MODE) {
      return {
        status: 'ok',
        mode: 'demo',
        message: 'Demo mode (localStorage)',
      };
    }

    // Production mode: Check API
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Clear leaderboard (demo mode only)
 * @returns {Promise<object>} Response data
 */
export async function clearLeaderboard() {
  if (DEMO_MODE) {
    console.log('[DEMO] Clearing leaderboard');
    return await localStorageLeaderboard.clearLeaderboard();
  }

  throw new Error('clearLeaderboard is only available in demo mode');
}

/**
 * Update username of recent scores (demo mode only)
 * Useful when a player changes their name after scoring
 * @param {string} oldUsername - The old username to find
 * @param {string} newUsername - The new username to set
 * @returns {Promise<object>} Response data
 */
export async function updateRecentUsername(oldUsername, newUsername) {
  if (DEMO_MODE) {
    console.log('[DEMO] Updating recent username:', oldUsername, '->', newUsername);
    return await localStorageLeaderboard.updateRecentUsername(oldUsername, newUsername);
  }

  // Backend mode: not supported (scores are immutable in backend)
  console.warn('updateRecentUsername is only available in demo mode');
  return { message: 'Not supported in backend mode', updated: 0 };
}

/**
 * Check if running in demo mode
 * @returns {boolean} True if in demo mode
 */
export function isDemoMode() {
  return DEMO_MODE;
}

export default {
  saveScore,
  getLeaderboard,
  getUserScores,
  checkHealth,
  clearLeaderboard,
  updateRecentUsername,
  isDemoMode,
  DEMO_MODE,
};
