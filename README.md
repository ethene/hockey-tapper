# 🏒 Hockey Tapper

> A physics-based hockey tapper game built with Vue 3 and Express. Features character animations, puck physics, combo multipliers, and particle effects.

**Status:** Production Ready (M2.5 Complete)
**Demo:** Coming Soon
**Documentation:** [View Docs](docs/) | [Quick Start](QUICKSTART.md) | [Deployment Guide](DEPLOYMENT.md)

---

## ✨ Features

### Game Mechanics
- ✅ **Character Animation System** - 4-state animation (idle → windup → hit → cooldown)
- ✅ **Physics-Based Shooting** - Gravity, velocity, and collision detection
- ✅ **Target Zones** - 5 strategic positions with score values (50-200 pts)
- ✅ **Combo Multiplier System** - 5 tiers (1.0x → 3.0x) with milestone rewards
- ✅ **Particle Effects** - Canvas-based explosion effects at 60 FPS
- ✅ **Sound System** - 5 sound effects with audio pooling (3 instances each)

### Technical Features
- ✅ **Responsive Design** - Optimized for 320px - 1920px viewports
- ✅ **localStorage Mode** - Works without backend (demo/static hosting)
- ✅ **Comprehensive Tests** - 222 tests passing in 17.89s
- ✅ **Production Build** - 63KB gzipped bundle
- ✅ **Deployment Ready** - Vercel/Netlify configs included

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7.0 (for backend)
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/hockey-tapper.git
cd hockey-tapper

# Install dependencies (monorepo)
npm install

# Start development servers (both frontend + backend)
npm run dev
```

The game will open at `http://localhost:5173`

**Note:** Frontend works standalone (localStorage mode) without backend!

---

## 🎮 How to Play

1. **Tap** the puck to trigger shot animation
2. **Hit targets** positioned around the ice rink
3. **Build combos** by hitting consecutive targets
4. **Maximize score** within 30 seconds
5. **Compete** on the leaderboard

**Scoring:**
- Top target: 200 pts
- Middle targets: 100 pts
- Bottom targets: 50 pts
- Accuracy bonus: +0-50 pts (based on center distance)
- Combo multipliers: 1.2x (5 hits) → 3.0x (20+ hits)

---

## 🛠️ Development

### Commands

```bash
# Development
npm run dev              # Start both frontend + backend
npm run web              # Frontend only (:5173)
npm run server           # Backend only (:8080)

# Testing
npm run test             # Run all tests (222 tests)
npm run test -- --watch  # Watch mode
npm run test -- --coverage  # With coverage

# Build & Deploy
npm run build            # Production build (apps/web/dist)
npm run lint             # Lint all workspaces
npm run format           # Format with Prettier
```

### Workspace Structure

```
hockey-tapper/
├── apps/
│   ├── web/                 # Vue 3 frontend
│   │   ├── src/
│   │   │   ├── components/  # Vue components
│   │   │   ├── composables/ # Reusable logic (physics, combo, sound)
│   │   │   ├── config/      # Game configuration
│   │   │   ├── services/    # API client
│   │   │   └── styles/      # SCSS + design tokens
│   │   ├── public/assets/   # Game assets (sprites, sounds)
│   │   └── dist/            # Production build
│   └── server/              # Express backend
│       ├── src/
│       │   ├── models/      # Mongoose schemas
│       │   ├── routes/      # API endpoints
│       │   └── index.js     # Server entry
│       └── .env             # Environment config
├── docs/                    # Documentation
│   ├── archive/             # Session history
│   ├── guides/              # Technical guides
│   └── specs/               # Feature specs
├── packages/                # Shared code (future)
└── docker/                  # MongoDB Docker setup
```

---

## 🧪 Testing

**Test Suite:** 222 tests passing in 17.89 seconds

### Coverage

- **usePhysics:** 65 tests (puck physics, collision detection)
- **useAnimationController:** 58 tests (animation state machine)
- **localStorageLeaderboard:** 44 tests (storage, sorting, limits)
- **useCombo:** 30 tests (combo logic, multipliers, milestones)
- **useSound:** 25 tests (audio pooling, preloading, playback)

### Run Tests

```bash
cd apps/web
npm run test                  # All tests
npm run test -- --watch       # Watch mode
npm run test -- --coverage    # Coverage report
```

---

## 🎨 Tech Stack

### Frontend
- **Vue 3** (Composition API) - Reactive UI framework
- **Vite** - Fast build tool with HMR
- **HTML5 Canvas** - Character animations + particle effects
- **SCSS** - Styling with Figma design tokens
- **Vitest** - Unit testing framework
- **Axios** - HTTP client (optional with localStorage mode)

### Backend
- **Express** - Node.js web framework
- **Mongoose** - MongoDB ODM
- **MongoDB 7.0** - Document database

### Tooling
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **npm workspaces** - Monorepo management

---

## 📦 Deployment

### Static Hosting (Frontend Only)

**Vercel:**
```bash
cd apps/web
npx vercel --prod
```

**Netlify:**
```bash
cd apps/web
npx netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
cd apps/web
npm run build
npx gh-pages -d dist
```

### Full Stack Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Backend deployment (Railway, Render, Fly.io)
- Database setup (MongoDB Atlas)
- Environment configuration
- CI/CD pipelines

---

## 📚 Documentation

- **[FEATURES.md](FEATURES.md)** - Complete feature specifications (M1-M6)
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** - Roadmap and milestones
- **[PROJECT_STATE.md](PROJECT_STATE.md)** - Current progress (21 sessions tracked)
- **[CLAUDE.md](CLAUDE.md)** - Architecture guide for Claude Code
- **[QUICKSTART.md](QUICKSTART.md)** - 30-second setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment checklists and configs
- **[docs/archive/](docs/archive/)** - Session summaries and technical audits

---

## 🗺️ Roadmap

### Completed Milestones ✅

**M1: MVP** (Week 1)
- ✅ Basic tap mechanic with timer
- ✅ Score persistence (MongoDB)
- ✅ Leaderboard display
- ✅ Design tokens from Figma

**M2: Core Mechanics** (Weeks 2-4)
- ✅ Character animation system (4 states)
- ✅ Puck physics with collision detection
- ✅ Target zones (5 positions)
- ✅ Visual feedback (particles, score popups)
- ✅ Enhanced scoring with accuracy bonuses

**M2.5: Production Ready** (Week 5)
- ✅ Combo multiplier system (5 tiers)
- ✅ Sound effects with pooling
- ✅ Comprehensive test suite (222 tests)
- ✅ Production build optimization (63KB)
- ✅ Deployment configurations

### Upcoming Milestones 🚧

**M3: Telegram Integration** (Weeks 6-7)
- [ ] Telegram WebApp SDK integration
- [ ] User authentication via Telegram
- [ ] Theme support (light/dark mode)
- [ ] Haptic feedback
- [ ] Deep linking for challenges

**M4: Enhanced Gameplay** (Weeks 8-10)
- [ ] Multiple playable characters (5 total)
- [ ] Power-ups system (5 types)
- [ ] Daily challenges
- [ ] Achievement system

**M5: Social & Monetization** (Weeks 11-13)
- [ ] Friend leaderboards
- [ ] Challenge friends feature
- [ ] In-app purchases (Telegram Stars)
- [ ] Referral system

**M6: Polish & Optimization** (Weeks 14-15)
- [ ] Performance optimization (60 FPS guaranteed)
- [ ] Error tracking (Sentry)
- [ ] Analytics integration
- [ ] Localization (5 languages)

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Design assets extracted from Figma via MCP
- Character sprites and animations by [Your Designer]
- Sound effects from [Source]

---

**Built with ❤️ using Vue 3 + Express**

[⬆ Back to top](#-hockey-tapper)
