/**
 * localStorage Leaderboard Service
 *
 * Provides the same API interface as the backend MongoDB service,
 * but persists scores to browser localStorage for demo/offline mode.
 *
 * Storage Schema:
 * Key: 'hockey_tapper_scores'
 * Value: JSON array of score objects
 * [
 *   { id: 'uuid', score: 1250, username: 'Player', timestamp: 1699123456789 },
 *   ...
 * ]
 */

const STORAGE_KEY = 'hockey_tapper_scores'
const MAX_SCORES = 100 // Keep top 100 scores

/**
 * Generate a simple UUID v4
 */
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get all scores from localStorage
 * @returns {Array} Array of score objects
 */
const getScores = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading scores from localStorage:', error)
    return []
  }
}

/**
 * Save scores array to localStorage
 * @param {Array} scores - Array of score objects
 */
const saveScores = (scores) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch (error) {
    console.error('Error saving scores to localStorage:', error)
    throw new Error('Failed to save scores')
  }
}

/**
 * Save a new score to localStorage
 * Mimics POST /api/score
 *
 * @param {number} score - The score value
 * @param {string} username - Player username (optional)
 * @returns {Promise<Object>} Response object with saved score data
 */
export const saveScoreLocal = async (score, username = 'Player') => {
  // Input validation
  if (typeof score !== 'number' || score < 0) {
    throw new Error('Invalid score: must be a non-negative number')
  }

  if (!Number.isInteger(score)) {
    throw new Error('Invalid score: must be an integer')
  }

  // Sanitize username
  const sanitizedUsername = String(username).trim() || 'Player'

  // Get existing scores
  const scores = getScores()

  // Create new score entry
  const newScore = {
    id: generateId(),
    score,
    username: sanitizedUsername,
    timestamp: Date.now(),
  }

  // Add to array
  scores.push(newScore)

  // Sort by score (descending), then by timestamp (ascending - older first)
  scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return a.timestamp - b.timestamp
  })

  // Keep only top MAX_SCORES
  const topScores = scores.slice(0, MAX_SCORES)

  // Save back to localStorage
  saveScores(topScores)

  // Simulate async operation (like API call)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Score saved successfully',
        data: newScore,
      })
    }, 50) // Small delay to simulate network
  })
}

/**
 * Get leaderboard (top N scores)
 * Mimics GET /api/leaderboard?limit=N
 *
 * @param {number} limit - Number of scores to return (default: 20, max: 100)
 * @returns {Promise<Object>} Response object with leaderboard data
 */
export const getLeaderboard = async (limit = 20) => {
  // Validate and clamp limit
  const clampedLimit = Math.min(Math.max(1, parseInt(limit) || 20), MAX_SCORES)

  // Get scores
  const scores = getScores()

  // Get top N
  const topScores = scores.slice(0, clampedLimit)

  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        count: topScores.length,
        data: topScores,
      })
    }, 50)
  })
}

/**
 * Get user's score history
 * Mimics GET /api/score/:userId?limit=N
 *
 * @param {string} username - Username to filter by
 * @param {number} limit - Number of scores to return (default: 10, max: 50)
 * @returns {Promise<Object>} Response object with user scores
 */
export const getUserScores = async (username, limit = 10) => {
  // Validate limit
  const clampedLimit = Math.min(Math.max(1, parseInt(limit) || 10), 50)

  // Get all scores
  const scores = getScores()

  // Filter by username
  const userScores = scores.filter(
    (s) => s.username.toLowerCase() === username.toLowerCase()
  )

  // Take top N (already sorted)
  const topUserScores = userScores.slice(0, clampedLimit)

  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        username,
        count: topUserScores.length,
        data: topUserScores,
      })
    }, 50)
  })
}

/**
 * Clear all scores (for testing/reset)
 *
 * @returns {Promise<Object>} Response object
 */
export const clearLeaderboard = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY)

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: 'Leaderboard cleared successfully',
        })
      }, 50)
    })
  } catch (error) {
    console.error('Error clearing leaderboard:', error)
    throw new Error('Failed to clear leaderboard')
  }
}

/**
 * Get leaderboard statistics
 *
 * @returns {Promise<Object>} Stats object
 */
export const getStats = async () => {
  const scores = getScores()

  if (scores.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      highScore: 0,
      lowScore: 0,
    }
  }

  const total = scores.reduce((sum, s) => sum + s.score, 0)
  const average = Math.round(total / scores.length)
  const high = Math.max(...scores.map((s) => s.score))
  const low = Math.min(...scores.map((s) => s.score))

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalGames: scores.length,
        averageScore: average,
        highScore: high,
        lowScore: low,
      })
    }, 50)
  })
}

/**
 * Update the username of the most recent score(s)
 * Used when a player changes their username after scoring
 *
 * @param {string} oldUsername - The old username to find
 * @param {string} newUsername - The new username to set
 * @param {number} maxAge - Maximum age in milliseconds to consider (default: 60 seconds)
 * @returns {Promise<Object>} Response object with update count
 */
export const updateRecentUsername = async (oldUsername, newUsername, maxAge = 60000) => {
  try {
    // Get all scores
    const scores = getScores()

    // Sanitize usernames
    const sanitizedOld = String(oldUsername).trim() || 'Player'
    const sanitizedNew = String(newUsername).trim() || 'Player'

    // If same username, no update needed
    if (sanitizedOld.toLowerCase() === sanitizedNew.toLowerCase()) {
      return {
        message: 'No update needed',
        updated: 0,
      }
    }

    // Find scores from the old username within the time window
    const now = Date.now()
    let updateCount = 0

    scores.forEach((score) => {
      // Check if this score matches the old username and is recent
      if (
        score.username.toLowerCase() === sanitizedOld.toLowerCase() &&
        now - score.timestamp <= maxAge
      ) {
        score.username = sanitizedNew
        updateCount++
      }
    })

    // Save updated scores
    if (updateCount > 0) {
      saveScores(scores)
      console.log(`[DEMO] Updated ${updateCount} score(s) from "${sanitizedOld}" to "${sanitizedNew}"`)
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: `Updated ${updateCount} score(s)`,
          updated: updateCount,
        })
      }, 50)
    })
  } catch (error) {
    console.error('Error updating username:', error)
    throw new Error('Failed to update username')
  }
}

/**
 * Check if localStorage is available
 *
 * @returns {boolean} True if localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}
