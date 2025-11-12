// Initialize MongoDB database for hockey_tapper
db = db.getSiblingDB('hockey_tapper');

// Create scores collection with validation
db.createCollection('scores', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['score', 'createdAt'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'Optional user identifier',
        },
        score: {
          bsonType: 'int',
          minimum: 0,
          description: 'Score value - must be a non-negative integer',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Timestamp when score was recorded',
        },
      },
    },
  },
});

// Create indexes for better query performance
db.scores.createIndex({ score: -1 }); // For leaderboard queries
db.scores.createIndex({ createdAt: -1 }); // For recent scores
db.scores.createIndex({ userId: 1, createdAt: -1 }); // For user history

print('MongoDB initialized successfully for hockey_tapper');
