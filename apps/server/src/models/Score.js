import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Score must be an integer',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard queries (sort by score descending)
scoreSchema.index({ score: -1, createdAt: -1 });

// Index for user history queries
scoreSchema.index({ userId: 1, createdAt: -1 });

const Score = mongoose.model('Score', scoreSchema);

export default Score;
