import express from 'express';
import Score from '../models/Score.js';

const router = express.Router();

/**
 * POST /api/score
 * Save a new score
 * Body: { score: number, userId?: string }
 */
router.post('/score', async (req, res) => {
  try {
    const { score, userId } = req.body;

    // Validation
    if (score === undefined || score === null) {
      return res.status(400).json({ error: 'Score is required' });
    }

    if (!Number.isInteger(score) || score < 0) {
      return res.status(400).json({
        error: 'Score must be a non-negative integer',
      });
    }

    // Create and save score
    const newScore = new Score({
      score,
      userId: userId || undefined,
    });

    await newScore.save();

    res.status(201).json({
      success: true,
      data: {
        id: newScore._id,
        score: newScore.score,
        userId: newScore.userId,
        createdAt: newScore.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

/**
 * GET /api/leaderboard
 * Get top 20 scores
 * Query params: limit (default: 20)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const topScores = await Score.find()
      .sort({ score: -1, createdAt: -1 })
      .limit(limit)
      .select('score userId createdAt')
      .lean();

    res.json({
      success: true,
      data: topScores.map((item, index) => ({
        rank: index + 1,
        id: item._id,
        score: item.score,
        userId: item.userId || 'Anonymous',
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/score/:userId
 * Get user's score history
 * Query params: limit (default: 10)
 */
router.get('/score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const userScores = await Score.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('score createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        userId,
        scores: userScores,
        count: userScores.length,
      },
    });
  } catch (error) {
    console.error('Error fetching user scores:', error);
    res.status(500).json({ error: 'Failed to fetch user scores' });
  }
});

export default router;
