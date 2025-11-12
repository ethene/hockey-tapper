# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hockey Tapper is a Telegram mini-app tapper game built as an npm workspace monorepo. Players tap a hockey puck within 30 seconds to score points, which are persisted to MongoDB and displayed on a leaderboard.

**Tech Stack:** Vue 3 (Composition API) + Vite, Express + Mongoose, MongoDB 7.0

## Development Commands

```bash
# Start development (both frontend & backend)
npm run dev              # Runs web on :5173, server on :8080

# Start individually
npm run web              # Frontend only
npm run server           # Backend only

# Code quality
npm run lint             # Lint all workspaces
npm run format           # Format with Prettier
npm run test             # Run all workspace tests

# Frontend-specific (from apps/web/)
npm run dev              # Vite dev server
npm run build            # Production build
npm run test             # Vitest tests
npm run test -- --watch  # Watch mode
npm run test -- --coverage  # With coverage

# Backend-specific (from apps/server/)
npm run dev              # Node with --watch flag
npm run start            # Production mode

# Database
npm run db:init          # Initialize MongoDB with schemas/indexes
mongosh hockey_tapper    # Direct MongoDB access
```

## Architecture

### Monorepo Structure
This is an npm workspace with two apps:
- `apps/web/` - Vue 3 SFC frontend
- `apps/server/` - Express REST API backend
- `packages/` - Reserved for shared code (future use)

### Design System Integration
**Critical:** All design tokens are extracted from Figma via MCP and stored in `apps/web/src/styles/_tokens.scss`. This file is **auto-imported globally** via Vite config, so all Vue components have immediate access to SCSS variables and mixins.

**When styling components:**
- Always use token variables (e.g., `$color-primary-blue`, `$spacing-lg`)
- Never hardcode colors, spacing, typography, or radii
- Use provided mixins (e.g., `@include text-medium`, `@include flex-center`)
- Tokens are available as both CSS custom properties (`:root` vars) and SCSS variables

**To re-sync from Figma:**
Use MCP tools (`mcp__figma-api__get_figma_data` and `mcp__figma-api__download_figma_images`) to fetch updated tokens and assets. See README.md "Figma Integration (MCP)" section for node IDs and file keys.

### Frontend Architecture (apps/web/)

**Component Hierarchy:**
```
App.vue (routing shell)
└── GameScreen.vue (game orchestrator)
    ├── TopBar.vue (username, badge)
    ├── ScoreBoard.vue (score + timer display)
    ├── TapButton.vue (puck tap target)
    └── AppModal.vue (game-over overlay)
        └── Leaderboard.vue (top scores)
```

**Game State Management:**
Game state lives in `GameScreen.vue` using Vue 3 Composition API refs:
- `score` - Current points (increments by 100 per tap)
- `timer` - Countdown from 30 seconds
- `isPlaying` - Controls tap button enabled state
- `showModal` - Toggles game-over modal

**Game Flow:**
1. `startGame()` - Resets state, starts 1s interval timer
2. User taps `TapButton` → emits `@tap` → `handleTap()` increments score
3. Timer hits 0 → `endGame()` clears interval, calls `saveScore()` API, shows modal
4. Modal displays final score + `Leaderboard` (auto-fetches on mount)

**API Service Pattern:**
Frontend uses `apps/web/src/services/api.js` (Axios client) for all backend communication:
- `saveScore(score, userId)` - POST /api/score
- `getLeaderboard(limit)` - GET /api/leaderboard
- `getUserScores(userId, limit)` - GET /api/score/:userId
- `checkHealth()` - GET /health

Base URL configured via `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080/api`).

### Backend Architecture (apps/server/)

**Server Bootstrap:** `src/index.js` connects to MongoDB before starting Express. Server will exit(1) if DB connection fails.

**Request Flow:**
```
Express middleware stack:
1. CORS (origin from CORS_ORIGIN env var)
2. JSON body parser
3. Request logger
4. Routes (/api/*)
5. 404 handler
6. Error handler
```

**Data Model:**
Single Mongoose model: `Score` (`src/models/Score.js`)
```javascript
{
  userId: String (optional, indexed),
  score: Number (required, min: 0, integer only),
  createdAt: Date (auto-generated, indexed)
}
```

**Indexes:**
- `{ score: -1, createdAt: -1 }` - Leaderboard queries (primary)
- `{ userId: 1, createdAt: -1 }` - User history
- `{ createdAt: -1 }` - Recency

**API Routes:** All in `src/routes/score.js`
- `POST /api/score` - Save score (validates integer >= 0)
- `GET /api/leaderboard?limit=N` - Top N scores (default 20, max 100)
- `GET /api/score/:userId?limit=N` - User's score history (default 10, max 50)

### Database Setup

MongoDB runs locally via Homebrew (not Docker in this setup). Database name: `hockey_tapper`, collection: `scores`.

**To reset/initialize DB:**
```bash
npm run db:init  # Runs docker/mongo/init-mongo.js via mongosh
```

This creates the collection with JSON schema validation and indexes.

## Key Configuration Files

**Vite Config (`apps/web/vite.config.js`):**
- Alias: `@` → `apps/web/src/`
- **SCSS tokens auto-imported globally** via `additionalData`
- Dev server: strict port 5173

**Environment Variables:**
- `apps/server/.env` - Backend config (MONGODB_URI, PORT, CORS_ORIGIN)
- `apps/web/.env` - Frontend config (VITE_API_BASE_URL)

**ESLint:**
- Root + per-workspace configs
- Vue plugin enabled for .vue files
- `vue/multi-word-component-names` rule disabled

## Testing

**Frontend:** Vitest + Vue Test Utils
- Test files: `apps/web/src/components/__tests__/*.test.js`
- Example: `TapButton.test.js` shows component mount, event emission testing

**Backend:** No tests currently configured (add as needed)

## Figma-Driven Development

This project uses MCP (Model Context Protocol) to sync design tokens and assets from Figma. The source file is "Telegram Hockey App — CG" (file key: `VY6fmYah6refyjZpr2ZWtV`, node: `68-2510`).

**When design updates are needed:**
1. Use MCP tools to fetch latest Figma data
2. Update `_tokens.scss` with new values
3. Re-export assets to `apps/web/public/assets/` if visual changes
4. Components will automatically pick up token changes (hot reload)

**Never** bypass the design system by hardcoding values in components.

## Common Patterns

**Adding a new Vue component:**
1. Create in `apps/web/src/components/YourComponent.vue`
2. Use `<script setup>` (Composition API)
3. Import tokens in `<style scoped lang="scss">`
4. Tokens are globally available, no manual import needed

**Adding a new API endpoint:**
1. Add route handler to `apps/server/src/routes/score.js` (or new route file)
2. Register route in `apps/server/src/index.js` via `app.use()`
3. Add corresponding function to `apps/web/src/services/api.js`
4. Use in components via `import { yourFunction } from '@/services/api.js'`

**Styling components:**
```scss
<style scoped lang="scss">
.my-component {
  color: $color-primary-blue;        // Token variable
  padding: $spacing-lg;              // Token spacing
  border-radius: $radius-base;       // Token radius
  @include text-medium;              // Token mixin
  @include flex-center;              // Layout mixin
}
</style>
```

## Current State & Roadmap

**Milestone 1 (Complete):**
- Full game loop with 30s timer
- Score persistence to MongoDB
- Leaderboard display
- Figma design tokens integrated
- Local development setup

**Milestone 2 (Planned):**
- Telegram WebApp SDK integration
- Launch parameter handling
- `sendData` score submission
- Telegram user authentication
- Theme integration (light/dark)

When adding Telegram integration, update `apps/web/src/main.js` to initialize the WebApp SDK before mounting the Vue app.
