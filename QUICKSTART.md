# Quick Start Guide

## ✅ Setup Complete!

Your Hockey Tapper project is fully configured and ready to run.

## What's Been Set Up

### ✓ Figma Integration
- Design tokens extracted and stored in `apps/web/src/styles/_tokens.scss`
- Game assets exported to `apps/web/public/assets/`
- MCP connection configured for future syncs

### ✓ Frontend (Vue 3 + Vite)
- All components built: GameScreen, TapButton, ScoreBoard, TopBar, AppModal, Leaderboard
- SCSS tokens system with CSS variables
- 30-second tap game logic implemented
- API integration with backend
- Dependencies installed ✓

### ✓ Backend (Express + Mongoose)
- API server configured on port 8080
- MongoDB connected (local installation via Homebrew)
- Score saving and leaderboard endpoints working
- Database initialized with proper schemas and indexes
- Dependencies installed ✓

### ✓ Database (MongoDB 7.0)
- Running via Homebrew services
- Database: `hockey_tapper`
- Collection: `scores` (with validation and indexes)
- Test score added successfully ✓

## 🚀 Start the App

### Option 1: Start Everything Together (Recommended)
```bash
npm run dev
```
This starts both frontend (port 5173) and backend (port 8080) concurrently.

### Option 2: Start Separately
```bash
# Terminal 1: Frontend
npm run web

# Terminal 2: Backend
npm run server
```

## 🎮 Play the Game

1. Open http://localhost:5173 in your browser
2. Game auto-starts with a 30-second timer
3. Tap the hockey puck to score points (+100 per tap)
4. When time runs out:
   - Your score is saved to MongoDB
   - Game-over modal appears
   - View the leaderboard
   - Click "Play Again" to restart

## 🔍 Verify Everything Works

### Check MongoDB
```bash
# See if MongoDB is running
brew services list | grep mongodb

# Query the database
mongosh hockey_tapper --eval "db.scores.find().pretty()"
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8080/health

# Get leaderboard
curl http://localhost:8080/api/leaderboard

# Save a test score
curl -X POST http://localhost:8080/api/score \
  -H "Content-Type: application/json" \
  -d '{"score": 2000, "userId": "Tester"}'
```

## 📁 Project Structure

```
hockey_tapper/
├── apps/
│   ├── web/                    # Vue 3 frontend
│   │   ├── src/
│   │   │   ├── components/     # All game components
│   │   │   ├── services/       # API client
│   │   │   └── styles/         # Design tokens + global styles
│   │   └── public/assets/      # Figma assets
│   └── server/                 # Express backend
│       └── src/
│           ├── models/         # Mongoose schemas
│           └── routes/         # API routes
├── docker/                     # Docker config (optional)
└── README.md                   # Full documentation
```

## 🛠 Common Commands

```bash
# Development
npm run dev          # Start both servers
npm run web          # Start frontend only
npm run server       # Start backend only

# Code Quality
npm run lint         # Lint all code
npm run format       # Format with Prettier
npm run test         # Run all tests

# Database
npm run db:init      # Re-initialize MongoDB
mongosh hockey_tapper   # Open Mongo shell

# Stop MongoDB
brew services stop mongodb-community@7.0
```

## 🎨 Design Tokens

All design values from Figma are in:
```
apps/web/src/styles/_tokens.scss
```

Use them in your components:
```scss
.my-component {
  color: $color-primary-blue;
  padding: $spacing-lg;
  @include text-medium;
}
```

## 📊 API Endpoints

- `GET /health` - Server health status
- `POST /api/score` - Save a score
- `GET /api/leaderboard?limit=20` - Get top scores
- `GET /api/score/:userId?limit=10` - Get user's score history

## 🐛 Troubleshooting

### MongoDB not starting?
```bash
brew services restart mongodb-community@7.0
```

### Port already in use?
```bash
# Kill process on port 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### SCSS errors?
```bash
cd apps/web && npm install sass --save-dev
```

## 🎯 Next Steps (Milestone 2)

When ready for Telegram integration:
1. Install Telegram WebApp SDK
2. Add WebApp initialization in `main.js`
3. Handle launch parameters
4. Implement `sendData` for score submission
5. Add user authentication via Telegram

## 📖 Full Documentation

See `README.md` for complete documentation including:
- Detailed API documentation
- Figma MCP sync instructions
- Component architecture
- Testing guide
- Production build steps

---

**Ready to play! Run `npm run dev` and visit http://localhost:5173** 🏒🎮
