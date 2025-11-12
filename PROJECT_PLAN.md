# Hockey Tapper - Master Project Plan

## Project Vision
A Telegram mini-app hockey tapper game where players control an animated character to shoot pucks at targets within a time limit, competing for high scores on a global leaderboard.

## Current Status: Milestone 1 Complete (MVP - Simplified Version)

**What's Built:**
- ✅ Basic tap mechanic (simple counter, no shot physics)
- ✅ 30-second timer
- ✅ Score persistence (MongoDB)
- ✅ Leaderboard display
- ✅ Design tokens from Figma
- ✅ Basic UI components (no animations)
- ✅ API backend (Express + Mongoose)
- ✅ Local development environment

**What's Missing (per Figma design):**
- ❌ Character idle animations
- ❌ Character hit/tap animations
- ❌ Shot mechanics (puck physics)
- ❌ Waiting/cooldown states
- ❌ Multiple character selection
- ❌ Visual feedback effects (Goal!/Miss!)
- ❌ Progressive difficulty
- ❌ Power-ups/bonuses

---

## High-Level Roadmap

### Phase 1: Core Game Mechanics (Milestone 2)
**Goal:** Implement the full game loop as designed in Figma

**Duration:** 2-3 weeks

**Deliverables:**
1. Character animation system (idle + hit states)
2. Shot mechanics with puck physics
3. Target zones with hit detection
4. Visual feedback (Goal!/Miss! animations)
5. Cooldown/waiting states
6. Enhanced scoring system (distance-based, combos)

### Phase 2: Telegram Integration (Milestone 3)
**Goal:** Deploy as a functional Telegram mini-app

**Duration:** 1-2 weeks

**Deliverables:**
1. Telegram WebApp SDK integration
2. User authentication via Telegram
3. Launch parameter handling
4. Score submission via WebApp.sendData()
5. Theme support (light/dark mode)
6. Haptic feedback integration
7. Deep linking support

### Phase 3: Enhanced Gameplay (Milestone 4)
**Goal:** Add depth and replayability

**Duration:** 2-3 weeks

**Deliverables:**
1. Multiple playable characters (3-5 options)
2. Character selection screen
3. Power-ups system (speed boost, multi-puck, etc.)
4. Combo multipliers (consecutive hits)
5. Progressive difficulty (moving targets)
6. Daily challenges
7. Achievement system

### Phase 4: Social & Monetization (Milestone 5)
**Goal:** Community engagement and revenue

**Duration:** 2-3 weeks

**Deliverables:**
1. Friend leaderboards
2. Challenge friends feature
3. Share score to Telegram
4. In-app purchases (character skins, power-ups)
5. Reward video ads
6. Referral system
7. Weekly tournaments

### Phase 5: Polish & Optimization (Milestone 6)
**Goal:** Production-ready release

**Duration:** 1-2 weeks

**Deliverables:**
1. Performance optimization (60 FPS target)
2. Asset optimization (reduce bundle size)
3. Error tracking (Sentry integration)
4. Analytics (user behavior, retention)
5. A/B testing framework
6. Localization (multi-language support)
7. Comprehensive end-to-end testing

---

## Technical Architecture Evolution

### Current (Milestone 1)
```
Vue 3 SPA → Express API → MongoDB
(Simple tap counter with score save)
```

### Target (Milestone 4+)
```
Vue 3 SPA with:
- Canvas-based game engine
- Animation state machine
- Physics simulation
- Asset loading system
↓
Express API with:
- Rate limiting
- Caching (Redis)
- WebSocket support (real-time events)
- Job queue (Bull)
↓
MongoDB + Redis
- Score persistence
- Session management
- Leaderboard caching
```

---

## Success Metrics

### Milestone 1 (✅ Complete)
- [x] Game runs locally without errors
- [x] Scores save to database
- [x] API endpoints functional
- [x] Basic UI matches Figma tokens

### Milestone 2 (Core Mechanics)
- [ ] Character animations run at 30+ FPS
- [ ] Shot physics feel responsive (<100ms delay)
- [ ] 90%+ shots register correctly
- [ ] Visual feedback appears within 1 frame

### Milestone 3 (Telegram Integration)
- [ ] App loads in Telegram WebView <2s
- [ ] User authentication 99%+ success rate
- [ ] Score submission 99%+ reliability
- [ ] No CORS or WebView compatibility issues

### Milestone 4 (Enhanced Gameplay)
- [ ] 5+ playable characters
- [ ] 10+ power-ups implemented
- [ ] Average session time: 5+ minutes
- [ ] 30%+ users complete daily challenge

### Milestone 5 (Social & Monetization)
- [ ] 20%+ users share scores
- [ ] 10%+ users make in-app purchase
- [ ] Friend challenge completion: 40%+
- [ ] Referral conversion: 15%+

### Milestone 6 (Production Ready)
- [ ] Lighthouse score: 90+ across all metrics
- [ ] Error rate: <0.1%
- [ ] 30-day retention: 25%+
- [ ] Support for 1000+ concurrent users

---

## Risk Assessment

### High Risk
1. **Animation Performance** - Complex canvas animations may lag on low-end devices
   - Mitigation: Performance profiling, fallback to simplified graphics

2. **Telegram WebView Compatibility** - Different behavior across iOS/Android
   - Mitigation: Extensive device testing, polyfills for compatibility

3. **Server Scaling** - Sudden viral growth could overwhelm infrastructure
   - Mitigation: Auto-scaling (Kubernetes), CDN for static assets, Redis caching

### Medium Risk
1. **Physics Tuning** - Shot mechanics may not feel satisfying
   - Mitigation: Extensive playtesting, adjustable parameters

2. **Monetization Balance** - IAP vs ads balance affects user experience
   - Mitigation: A/B testing, user feedback loops

### Low Risk
1. **Design Consistency** - Maintaining Figma fidelity as features grow
   - Mitigation: Token system already in place, regular design reviews

---

## Resource Requirements

### Milestone 2 (Core Mechanics)
- **Developer Time:** 80-120 hours
- **Designer Time:** 20-30 hours (animation assets)
- **Testing Time:** 20 hours

### Milestone 3 (Telegram Integration)
- **Developer Time:** 40-60 hours
- **Testing Time:** 30 hours (device matrix)
- **DevOps Time:** 10 hours (deployment setup)

### Milestones 4-6
- **Developer Time:** 200-300 hours total
- **Designer Time:** 40-60 hours (character variants, UI polish)
- **Testing Time:** 60-80 hours
- **DevOps Time:** 20-30 hours (scaling, monitoring)

---

## Dependencies & Prerequisites

### Before Milestone 2
- [ ] Finalize game mechanics design (shot physics, scoring rules)
- [ ] Export all character animation frames from Figma
- [ ] Define animation state transitions
- [ ] Create physics simulation prototype

### Before Milestone 3
- [ ] Set up Telegram Bot and mini-app
- [ ] Configure domain and SSL certificate
- [ ] Test WebView compatibility matrix
- [ ] Prepare deployment pipeline

### Before Milestone 4
- [ ] Design additional character sprites
- [ ] Define power-up mechanics and balance
- [ ] Create achievement/challenge database schema
- [ ] Design character selection UI

### Before Milestone 5
- [ ] Set up payment processing (Telegram Stars or external)
- [ ] Design monetization economy
- [ ] Create promotional assets for sharing
- [ ] Legal review (terms of service, privacy policy)

---

## Next Immediate Steps (Milestone 2 Kickoff)

1. **Week 1: Animation System**
   - Export character sprite sheets from Figma
   - Implement sprite animation engine
   - Create animation state machine (idle → windup → hit → cooldown)
   - Test animation performance

2. **Week 2: Shot Mechanics**
   - Implement puck physics (velocity, trajectory, collision)
   - Add target zones with hit detection
   - Create visual feedback system (Goal!/Miss! text)
   - Tune gameplay feel (shot power, cooldown timing)

3. **Week 3: Integration & Polish**
   - Connect animations to tap events
   - Add sound effects
   - Implement enhanced scoring (distance multipliers)
   - Playtest and iterate

---

## Questions to Resolve

1. **Character Animation:** Sprite sheets or skeletal animation? (Recommendation: Sprite sheets for simplicity)
2. **Physics Engine:** Custom or library (Matter.js, Planck.js)? (Recommendation: Custom for this simple use case)
3. **Scoring Formula:** Linear or exponential? Bonus for accuracy? (Needs game design input)
4. **Monetization:** Pay-to-play characters or cosmetic-only? (Needs business input)
5. **Server Architecture:** Monolith or microservices for scaling? (Recommendation: Start monolith, extract services if needed)

---

## Versioning & Release Strategy

### Alpha (Internal Testing)
- Milestone 2 complete
- Deployed to staging environment
- Internal team testing only

### Beta (Closed Testing)
- Milestone 3 complete
- Deployed as unlisted Telegram mini-app
- Invite-only testing (50-100 users)
- Collect feedback and metrics

### v1.0 (Public Launch)
- Milestone 4 complete
- Public Telegram mini-app listing
- Marketing campaign
- Monitor for critical issues

### v1.1+ (Iterative Updates)
- Milestone 5-6 features rolled out incrementally
- Weekly/bi-weekly releases
- Data-driven feature prioritization

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Owner:** Project Team
**Next Review:** Upon Milestone 2 completion
