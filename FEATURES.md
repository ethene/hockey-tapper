# Hockey Tapper - Feature Specifications

This document provides detailed specifications for all planned features based on the Figma design and game vision.

---

## Table of Contents
1. [Current Features (Milestone 1)](#milestone-1-current-features)
2. [Milestone 2: Core Game Mechanics](#milestone-2-core-game-mechanics)
3. [Milestone 3: Telegram Integration](#milestone-3-telegram-integration)
4. [Milestone 4: Enhanced Gameplay](#milestone-4-enhanced-gameplay)
5. [Milestone 5: Social & Monetization](#milestone-5-social--monetization)
6. [Milestone 6: Polish & Optimization](#milestone-6-polish--optimization)

---

## Milestone 1: Current Features

### 1.1 Basic Tap Game
**Status:** ✅ Implemented

**Description:** Simple tap counter that increments score by 100 points per tap within a 30-second time limit.

**User Flow:**
1. Game auto-starts on page load
2. User taps the puck button
3. Score increments (+100 per tap)
4. Timer counts down from 30s
5. At 0s, game ends and shows modal with final score

**Components:**
- `GameScreen.vue` - Main game container
- `TapButton.vue` - Tappable puck element
- `ScoreBoard.vue` - Score and timer display
- `AppModal.vue` - Game-over modal
- `Leaderboard.vue` - Top 10 scores

**API Endpoints:**
- `POST /api/score` - Save final score
- `GET /api/leaderboard` - Fetch top scores

**Limitations:**
- No character animations
- No shot physics or mechanics
- No visual feedback beyond score increment
- No cooldown or waiting states
- Single difficulty level

---

## Milestone 2: Core Game Mechanics

### 2.1 Character Animation System
**Status:** 📋 Planned

**Description:** Animated character sprite that responds to user actions with state-based animations.

**Animation States (per Figma annotations):**
1. **Idle** - "айдл анимация персонажа"
   - Looping animation when no user input
   - Subtle breathing/swaying motion
   - 4-6 frames, 8 FPS

2. **Windup** - Pre-shot preparation
   - Triggered on tap/click start
   - Character pulls back stick
   - 3-4 frames, 12 FPS, non-looping

3. **Hit** - "анимация удара"
   - Shot execution animation
   - Character swings stick forward
   - 5-7 frames, 16 FPS, non-looping

4. **Cooldown** - Post-shot recovery
   - Brief pause before returning to idle
   - 2-3 frames, 10 FPS, non-looping

**State Transitions:**
```
Idle → [user tap] → Windup → Hit → Cooldown → Idle
                      ↓
                  [during cooldown]
                      ↓
                   blocked
```

**Technical Implementation:**
- Use Canvas API or CSS sprite sheets
- `AnimationController` class to manage state machine
- Load sprite sheets at game start
- Preload all frames to prevent stuttering

**Asset Requirements:**
- Export character sprite sheets from Figma (multiple resolutions: 1x, 2x)
- Sprite atlas format: horizontal strip or JSON (TexturePacker)
- Total frames: ~20-25 per character

**Acceptance Criteria:**
- [ ] All 4 animation states play smoothly
- [ ] State transitions occur within 1 frame
- [ ] Animations run at 30+ FPS on target devices
- [ ] Sprite sheets load within 500ms

---

### 2.2 Shot Mechanics & Puck Physics
**Status:** 📋 Planned

**Description:** Replace simple tap counter with physics-based puck shooting that requires timing and accuracy.

**Game Loop (per Figma "02 Game - бросок" and "ожидание броска" screens):**

1. **Ready State**
   - Character in idle animation
   - Puck positioned at character's stick
   - UI shows "Tap to shoot!" prompt

2. **Shot Initiated** (user tap)
   - Character plays windup → hit animation
   - Puck velocity calculated based on:
     - Tap timing (optimal timing = max power)
     - Tap duration (hold = charge shot?)
   - Puck launches with trajectory

3. **Shot in Flight**
   - Puck travels with physics (velocity, gravity, friction)
   - Visual trail effect behind puck
   - Character in cooldown animation

4. **Shot Result**
   - **Goal:** Puck enters target zone
     - Show "Goal!" text (per Figma: "+100" floating text)
     - Award points based on target
     - Play success sound/haptic
   - **Miss:** Puck exits play area
     - Show "Miss!" text (per Figma: "-100" or 0 points)
     - Play miss sound

5. **Waiting State** (per Figma "ожидание броска")
   - Cooldown period (1-2 seconds)
   - Show loader/progress indicator
   - New puck spawns
   - Return to Ready State

**Physics Parameters:**
```javascript
const shotConfig = {
  baseVelocity: 800,        // pixels/second
  maxVelocity: 1200,        // max shot power
  gravity: 300,             // downward acceleration
  friction: 0.98,           // velocity decay per frame
  cooldownDuration: 1500,   // milliseconds
  shotAngle: 45,            // degrees (adjustable?)
};
```

**Target Zones (from Figma "02 Game" screens):**
- **Top Goal:** Small zone, high points (150-200)
- **Middle Goal:** Medium zone, medium points (100)
- **Bottom Goal:** Large zone, low points (50)
- **Miss:** Outside all zones (0 points)

**Visual Feedback (from Figma frames):**
- Floating score text ("+100", "+150", etc.) with fade-out animation
- "Goal!" / "Miss!" large text overlay
- Particle effects on successful goal
- Puck trail effect during flight

**Scoring Formula:**
```
baseScore = targetZone.points
accuracyBonus = (1 - distanceFromCenter) * 50
finalScore = baseScore + accuracyBonus
```

**Acceptance Criteria:**
- [ ] Shot timing affects puck power/trajectory
- [ ] Puck physics feel responsive and natural
- [ ] Target hit detection is accurate (no false positives/negatives)
- [ ] Visual feedback appears within 1 frame of result
- [ ] Cooldown prevents spam (enforced on client and server)

---

### 2.3 Enhanced Scoring System
**Status:** 📋 Planned

**Description:** Replace flat +100 per tap with dynamic scoring based on accuracy, timing, and combos.

**Scoring Components:**

1. **Base Score** (target zone)
   - Top zone: 200 points
   - Middle zone: 100 points
   - Bottom zone: 50 points

2. **Accuracy Bonus** (distance from center)
   - Perfect center: +50 points
   - Near center: +25 points
   - Edge hit: +0 points

3. **Combo Multiplier** (consecutive goals)
   - 2-hit combo: 1.5x multiplier
   - 3-hit combo: 2x multiplier
   - 5-hit combo: 3x multiplier
   - 10-hit combo: 5x multiplier
   - Combo resets on miss

4. **Time Bonus** (shots taken)
   - Early game (0-10s): 1x
   - Mid game (10-20s): 1.2x
   - Late game (20-30s): 1.5x (urgency bonus)

**Example Calculation:**
```
Shot: Top zone, near-center, 4th consecutive goal, at 22 seconds
baseScore = 200
accuracyBonus = 25
subtotal = 225
comboMultiplier = 2x
timeMultiplier = 1.5x
finalScore = 225 * 2 * 1.5 = 675 points
```

**UI Changes:**
- Show current combo count above score
- Animate combo multiplier (grow/pulse)
- Display breakdown in game-over modal
- Add "Best Combo" stat to leaderboard

**Acceptance Criteria:**
- [ ] Scoring formula implemented and tuned
- [ ] Combo counter displays correctly
- [ ] Score breakdown shown in modal
- [ ] Leaderboard tracks best combo stat

---

### 2.4 Progressive Difficulty
**Status:** 📋 Planned (Milestone 2 optional, may move to M4)

**Description:** Game becomes more challenging as time progresses to maintain engagement.

**Difficulty Mechanics:**
1. **Target Movement**
   - Targets start stationary
   - After 10s, targets slowly move horizontally
   - After 20s, targets move faster + vertically

2. **Cooldown Reduction**
   - Early game: 1.5s cooldown
   - Mid game: 1.2s cooldown
   - Late game: 1.0s cooldown

3. **Target Size**
   - Early game: Standard size
   - Late game: 80% of original size

**Acceptance Criteria:**
- [ ] Difficulty increases smoothly over time
- [ ] Game remains playable at highest difficulty
- [ ] Playtesting confirms engagement curve

---

## Milestone 3: Telegram Integration

### 3.1 WebApp SDK Integration
**Status:** 📋 Planned

**Description:** Integrate Telegram WebApp JavaScript SDK to run as a native-feeling mini-app inside Telegram.

**Implementation Steps:**

1. **Load SDK**
```javascript
// In index.html <head>
<script src="https://telegram.org/js/telegram-web-app.js"></script>

// In main.js, before Vue mount
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand(); // Full-screen mode
}
```

2. **Theme Integration**
```javascript
// Apply Telegram theme colors
const tg = window.Telegram.WebApp;
const theme = tg.themeParams;

document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color);
// ... apply other theme vars
```

3. **Viewport Configuration**
```javascript
tg.setHeaderColor('bg_color');
tg.setBackgroundColor(theme.bg_color);
tg.enableClosingConfirmation(); // Confirm before closing
```

**Acceptance Criteria:**
- [ ] App runs without errors in Telegram iOS WebView
- [ ] App runs without errors in Telegram Android WebView
- [ ] Theme matches Telegram appearance
- [ ] Full-screen mode works correctly
- [ ] Back button handled gracefully

---

### 3.2 User Authentication
**Status:** 📋 Planned

**Description:** Authenticate users via Telegram to associate scores with accounts and enable social features.

**User Flow:**
1. App loads in Telegram WebView
2. Extract `initData` from WebApp SDK
3. Send `initData` to backend for validation
4. Backend verifies signature using bot token
5. Return JWT or session token
6. Use token for all subsequent API calls

**Backend Validation:**
```javascript
// Telegram initData validation
function validateTelegramWebAppData(initData, botToken) {
  // Parse query string
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  // Create data-check-string
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Calculate secret key and hash
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}
```

**Data Stored:**
```javascript
{
  telegramId: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  username: user.username,
  photoUrl: user.photo_url,
  languageCode: user.language_code,
}
```

**Security:**
- Never trust client-side user data
- Always validate initData on server
- Use HTTPS only
- Implement rate limiting
- Store bot token securely (env vars)

**Acceptance Criteria:**
- [ ] User authentication works 99%+ of the time
- [ ] Invalid signatures rejected
- [ ] User data persisted correctly
- [ ] Scores associated with Telegram accounts

---

### 3.3 Score Submission via sendData()
**Status:** 📋 Planned

**Description:** Submit final score to Telegram bot backend using WebApp.sendData() method.

**Flow:**
1. Game ends (timer reaches 0)
2. Call `WebApp.sendData(JSON.stringify({ score, stats }))`
3. Telegram sends data to bot's web_app_data handler
4. Bot processes score, saves to database
5. Bot sends confirmation message to user

**Bot Webhook Handler:**
```python
# Example Python (aiogram)
@dp.message_handler(content_types=types.ContentType.WEB_APP_DATA)
async def handle_web_app_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    score = data['score']

    # Save to database
    await save_score(user_id=message.from_user.id, score=score)

    # Send confirmation
    await message.answer(f"🏒 Score saved: {score} points!\nYour rank: #{get_rank(message.from_user.id)}")
```

**Alternative: Direct API**
If not using sendData(), scores can still POST directly to API with Telegram auth token.

**Acceptance Criteria:**
- [ ] sendData() successfully transmits score
- [ ] Bot receives and processes data correctly
- [ ] User receives confirmation message
- [ ] Fallback to direct API if bot unavailable

---

### 3.4 Haptic Feedback
**Status:** 📋 Planned

**Description:** Use Telegram haptic API to provide tactile feedback for actions.

**Haptic Events:**
```javascript
const tg = window.Telegram.WebApp;

// Light impact - on tap
tg.HapticFeedback.impactOccurred('light');

// Medium impact - on goal
tg.HapticFeedback.impactOccurred('medium');

// Heavy impact - on miss or error
tg.HapticFeedback.impactOccurred('heavy');

// Success notification - on high score or achievement
tg.HapticFeedback.notificationOccurred('success');

// Error notification - on validation error
tg.HapticFeedback.notificationOccurred('error');
```

**Implementation Points:**
- Tap on puck: light impact
- Goal scored: medium impact + success notification
- Miss: light impact
- Combo milestone (5x, 10x): heavy impact + success notification
- Game end: medium impact

**Acceptance Criteria:**
- [ ] Haptics work on iOS Telegram
- [ ] Haptics work on Android Telegram
- [ ] No haptics on desktop (graceful degradation)
- [ ] User preference to disable haptics (settings)

---

### 3.5 Deep Linking & Sharing
**Status:** 📋 Planned

**Description:** Allow users to share scores and challenge friends via Telegram links.

**Share Button Implementation:**
```javascript
function shareScore(score, rank) {
  const text = `🏒 I scored ${score} points in Hockey Tapper!\nMy rank: #${rank}\n\nCan you beat me?`;
  const url = `https://t.me/YourBotUsername/game?startapp=challenge_${userId}`;

  window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
}
```

**Challenge Links:**
- Format: `https://t.me/BotUsername/game?startapp=challenge_123456`
- Parse `startapp` parameter in app
- Load challenger's score and show "Beat {name}'s score of {score}!" UI
- After game, compare and celebrate if beaten

**Acceptance Criteria:**
- [ ] Share button opens Telegram share sheet
- [ ] Challenge links deep-link correctly
- [ ] Challenged user sees custom UI
- [ ] Results compared and displayed

---

## Milestone 4: Enhanced Gameplay

### 4.1 Multiple Characters
**Status:** 📋 Planned

**Description:** Allow users to select from multiple playable characters, each with unique appearance and potentially stats.

**Character Roster (Initial):**
1. **Default Player** - Balanced stats (current character)
2. **Speed Demon** - Faster cooldown, lower power
3. **Power Shot** - Higher shot power, slower cooldown
4. **Lucky** - Higher accuracy bonus multiplier
5. **Combo King** - Combo builds faster, harder to maintain

**Character Selection Flow:**
1. Add "Characters" button to main menu (TopBar or modal)
2. Open character selection modal (grid of character cards)
3. Show character preview, stats, and unlock status
4. Tap to select (if unlocked)
5. Character persists for session (stored in localStorage)

**Character Data Structure:**
```javascript
{
  id: 'speed_demon',
  name: 'Speed Demon',
  description: 'Shoots fast but with less power',
  stats: {
    shotPower: 0.8,       // multiplier
    cooldown: 0.7,        // multiplier
    accuracyBonus: 1.0,
    comboMultiplier: 1.0,
  },
  spriteSheet: '/assets/characters/speed_demon.png',
  unlockCondition: {
    type: 'score',        // 'score' | 'games_played' | 'purchase'
    value: 5000,
  },
  unlocked: false,
}
```

**Unlock System:**
- Default character: Always unlocked
- Others: Unlock by reaching milestones (score thresholds, games played)
- Premium characters: IAP (Milestone 5)

**UI Components:**
- `CharacterSelect.vue` - Selection modal
- `CharacterCard.vue` - Individual character display
- `CharacterStats.vue` - Stat comparison

**Acceptance Criteria:**
- [ ] 5 characters implemented with unique sprites
- [ ] Character selection UI functional
- [ ] Character stats affect gameplay correctly
- [ ] Unlock progression working
- [ ] Selected character persists

---

### 4.2 Power-Ups System
**Status:** 📋 Planned

**Description:** Collectible power-ups that temporarily enhance player abilities.

**Power-Up Types:**

1. **Speed Boost** (⚡)
   - Effect: Reduce cooldown by 50% for 10 seconds
   - Visual: Blue aura around character

2. **Multi-Puck** (🏒🏒🏒)
   - Effect: Shoot 3 pucks simultaneously for 5 shots
   - Visual: Triple puck icon

3. **Giant Puck** (🔵)
   - Effect: Puck size x2, easier to hit targets for 5 shots
   - Visual: Enlarged puck with glow

4. **Score Multiplier** (✨)
   - Effect: All scores x2 for 15 seconds
   - Visual: Golden sparkles

5. **Auto-Aim** (🎯)
   - Effect: Shots automatically go to highest-value target for 10 shots
   - Visual: Targeting reticle

**Spawn System:**
- Power-ups spawn randomly during gameplay (10% chance per shot)
- Appear as floating icons on screen
- Expire after 5 seconds if not collected
- User taps/clicks to collect
- Can only hold 1 power-up at a time

**Activation:**
- Tap dedicated power-up button (bottom-right corner)
- Or auto-activate on collect (setting)

**UI Elements:**
- Power-up inventory slot (shows current power-up)
- Activation button (glows when available)
- Duration timer (circular progress)
- Spawn animation (fade-in + bounce)

**Acceptance Criteria:**
- [ ] 5 power-ups implemented and balanced
- [ ] Spawn rate feels appropriate (not too common/rare)
- [ ] Visual effects clearly communicate active power-up
- [ ] Power-ups stack appropriately (or don't stack)
- [ ] Duration timers accurate

---

### 4.3 Daily Challenges
**Status:** 📋 Planned

**Description:** Daily missions that reward players for specific accomplishments.

**Challenge Types:**

1. **Score Challenges**
   - "Reach 3,000 points in a single game"
   - "Earn a combined 10,000 points today"

2. **Accuracy Challenges**
   - "Hit 20 goals in a single game"
   - "Get 5 perfect center hits"

3. **Combo Challenges**
   - "Achieve a 10x combo"
   - "Maintain a combo for 15 seconds"

4. **Character Challenges**
   - "Play 3 games with Speed Demon"
   - "Win with each character once today"

5. **Power-Up Challenges**
   - "Collect 5 power-ups in a single game"
   - "Use Multi-Puck 10 times"

**Rewards:**
- Bonus points (added to leaderboard score? or separate currency?)
- Character unlocks
- Power-up drops
- Cosmetic items (Milestone 5)

**Challenge System:**
- Refreshes daily at midnight UTC
- 3 active challenges at a time
- Progress tracked in real-time
- Notification on completion
- Claim rewards in dedicated UI

**UI Components:**
- `ChallengePanel.vue` - Displays active challenges
- `ChallengeCard.vue` - Individual challenge with progress
- `RewardModal.vue` - Claim rewards

**Backend:**
- Store challenge progress per user
- Track completion timestamps
- Prevent duplicate rewards
- Generate new challenges daily (cron job)

**Acceptance Criteria:**
- [ ] 15+ unique challenges created
- [ ] Challenges refresh daily
- [ ] Progress tracked accurately
- [ ] Rewards distributed correctly
- [ ] UI clearly shows progress

---

### 4.4 Achievement System
**Status:** 📋 Planned

**Description:** Long-term achievements that track player milestones across all games.

**Achievement Categories:**

**Scoring Achievements:**
- "First Goal" - Score your first 100 points
- "Century" - Reach 100 points in a game
- "Millionaire" - Earn 1,000,000 total points
- "Perfect Game" - Reach 5,000 points with 100% accuracy

**Gameplay Achievements:**
- "Marathon" - Play 100 games
- "Speed Demon" - Complete a game in under 20 seconds
- "Sharpshooter" - Hit 50 consecutive goals
- "Power Player" - Use 100 power-ups

**Character Achievements:**
- "Collector" - Unlock all characters
- "Master" - Win 10 games with each character
- "Specialist" - Play 100 games with a single character

**Social Achievements:**
- "Social Butterfly" - Challenge 10 friends
- "Influencer" - Get 50 friends to play via your referral link
- "Champion" - Reach #1 on leaderboard

**Achievement Rewards:**
- Badge displayed on profile
- Exclusive character skins
- Leaderboard flair (icons next to name)

**Implementation:**
- Store achievement progress in user profile
- Check conditions after each game
- Trigger unlock animation + notification
- Display in dedicated achievements screen

**Acceptance Criteria:**
- [ ] 30+ achievements defined
- [ ] Progress tracked accurately
- [ ] Unlock animations polished
- [ ] Achievements screen implemented

---

## Milestone 5: Social & Monetization

### 5.1 Friend Leaderboards
**Status:** 📋 Planned

**Description:** Leaderboard filtered to show only Telegram friends who play the game.

**Implementation:**
- Telegram API provides friend list (if user grants permission)
- Query leaderboard for entries matching friend Telegram IDs
- Display in separate "Friends" tab alongside global leaderboard

**UI Changes:**
- Tabs: "Global" | "Friends" | "This Week"
- Friends leaderboard shows rank within friend group
- Highlight user's position
- Show friend's profile picture (from Telegram)

**Acceptance Criteria:**
- [ ] Friend list fetched correctly
- [ ] Friend leaderboard displays accurately
- [ ] Performance optimized (don't query all friends every load)

---

### 5.2 Challenge Friends Feature
**Status:** 📋 Planned

**Description:** Send direct challenges to specific friends via Telegram.

**Flow:**
1. Tap "Challenge Friend" button
2. Select friend from list (fetched from Telegram)
3. Send challenge message via Telegram with deep link
4. Friend taps link → opens game with challenge context
5. Friend plays game
6. Result sent back to challenger (you beat them / they beat you)
7. Notification in Telegram chat

**Challenge Message Format:**
```
🏒 [Your Name] challenges you to beat their score of 3,450 points!

[Play Now Button] → Deep link to game
```

**Acceptance Criteria:**
- [ ] Friend selection UI implemented
- [ ] Challenge sent via Telegram API
- [ ] Deep link opens game correctly
- [ ] Results compared and shared

---

### 5.3 In-App Purchases (IAP)
**Status:** 📋 Planned

**Description:** Monetization via Telegram Stars (Telegram's in-app currency) or external payment.

**Purchasable Items:**

1. **Character Unlocks**
   - Unlock all characters instantly: 50 Stars
   - Individual premium characters: 10 Stars each

2. **Power-Up Packs**
   - 5 power-ups of choice: 20 Stars
   - Random power-up bundle: 15 Stars

3. **Cosmetic Skins**
   - Character skins: 5-15 Stars
   - Puck skins: 3 Stars
   - Stadium themes: 10 Stars

4. **Boosts**
   - 2x XP for 24 hours: 30 Stars
   - Remove ads for 1 week: 20 Stars

**Implementation:**
```javascript
// Telegram Stars purchase
window.Telegram.WebApp.openInvoice(invoiceLink, (status) => {
  if (status === 'paid') {
    // Unlock item on backend
    unlockItem(itemId);
  }
});
```

**Backend:**
- Verify payment via Telegram Bot API
- Update user's inventory
- Sync across devices (stored in database, not localStorage)

**Acceptance Criteria:**
- [ ] Payment flow works correctly
- [ ] Items unlocked immediately after purchase
- [ ] Purchases persist across sessions
- [ ] Refund handling (if applicable)

---

### 5.4 Reward Video Ads
**Status:** 📋 Planned

**Description:** Allow users to watch video ads in exchange for power-ups or currency.

**Integration Options:**
1. **Google AdMob** (if deploying as standalone app)
2. **Telegram Ad Platform** (if available for mini-apps)
3. **Direct partnerships** with ad networks

**Reward Structure:**
- Watch 30s video → receive 1 random power-up
- Watch 3 videos daily → receive bonus points or currency
- Optional, never forced

**Implementation:**
- "Watch Ad" button in power-up menu
- Load ad SDK
- Track ad completion
- Distribute reward after verified view

**Acceptance Criteria:**
- [ ] Ads load reliably
- [ ] Rewards distributed correctly
- [ ] Ads are skippable after 30s
- [ ] Ad-free purchase option available

---

### 5.5 Referral System
**Status:** 📋 Planned

**Description:** Incentivize users to invite friends.

**Referral Flow:**
1. User taps "Invite Friends"
2. Generate unique referral link: `https://t.me/BotName/game?startapp=ref_<userId>`
3. Share link via Telegram, social media, etc.
4. Friend joins via link → tracked as referral
5. Referrer receives reward when referred user completes first game

**Rewards:**
- 1 referral: 100 bonus points
- 5 referrals: Unlock special character
- 10 referrals: Exclusive badge
- 50 referrals: Premium currency

**Tracking:**
- Store referrer ID on first game start (query param)
- Track in `users` table: `referredBy` field
- Increment referral count on referrer's profile

**Acceptance Criteria:**
- [ ] Referral links generated correctly
- [ ] Referrals tracked accurately
- [ ] Rewards distributed automatically
- [ ] Fraud prevention (1 referral per unique user)

---

## Milestone 6: Polish & Optimization

### 6.1 Performance Optimization
**Status:** 📋 Planned

**Target Metrics:**
- 60 FPS during gameplay (16.67ms per frame)
- First paint: <1.5s
- Time to interactive: <2.5s
- Bundle size: <500KB (gzipped)

**Optimization Strategies:**

**Frontend:**
- Code splitting (lazy load routes)
- Image optimization (WebP format, responsive images)
- Sprite sheet optimization (texture atlases)
- Remove unused dependencies
- Minify and compress assets
- Use service worker for caching

**Animation:**
- Use requestAnimationFrame for smooth animations
- Offload to Web Workers if needed
- GPU acceleration (transform, opacity only)
- Reduce draw calls (batch sprites)

**Backend:**
- Implement Redis caching for leaderboard
- Database query optimization (proper indexes)
- API response compression (gzip)
- CDN for static assets

**Acceptance Criteria:**
- [ ] Lighthouse performance score: 90+
- [ ] Gameplay consistently at 60 FPS
- [ ] No jank during animations
- [ ] Fast load times on 3G networks

---

### 6.2 Error Tracking & Analytics
**Status:** 📋 Planned

**Error Tracking (Sentry):**
```javascript
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Analytics (Custom or Google Analytics):**
- Track events:
  - Game start
  - Game end (with score, duration)
  - Character selection
  - Power-up usage
  - Purchase events
  - Social actions (share, challenge)

**Metrics to Track:**
- Daily Active Users (DAU)
- Retention (D1, D7, D30)
- Average session duration
- Average score
- Conversion rate (visitor → player)
- Monetization: ARPU, ARPPU

**Acceptance Criteria:**
- [ ] Error tracking active in production
- [ ] Critical errors alerted to team
- [ ] Analytics dashboard set up
- [ ] Weekly reports automated

---

### 6.3 Localization (i18n)
**Status:** 📋 Planned

**Supported Languages (initial):**
1. English (en)
2. Russian (ru) - Based on Figma annotations
3. Spanish (es)
4. Portuguese (pt)
5. German (de)

**Implementation (Vue I18n):**
```javascript
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      game: {
        title: 'Hockey Tapper',
        tapToShoot: 'Tap to shoot!',
        goal: 'Goal!',
        miss: 'Miss!',
      },
    },
    ru: {
      game: {
        title: 'Хоккейный таппер',
        tapToShoot: 'Нажми для удара!',
        goal: 'Гол!',
        miss: 'Мимо!',
      },
    },
  },
});
```

**Locale Detection:**
- Use Telegram user language (`window.Telegram.WebApp.initDataUnsafe.user.language_code`)
- Fallback to browser language
- Allow manual selection in settings

**Acceptance Criteria:**
- [ ] All UI text externalized to i18n files
- [ ] 5 languages supported
- [ ] Language switcher in settings
- [ ] RTL support (if Arabic added later)

---

### 6.4 End-to-End Testing
**Status:** 📋 Planned

**Testing Framework:** Playwright or Cypress

**Test Scenarios:**

1. **Core Game Loop**
   - Start game → tap puck → score increments → timer ends → modal shows

2. **Shot Mechanics**
   - Tap → animation plays → puck launches → goal detected → score updates

3. **Leaderboard**
   - Complete game → score saved → appears in leaderboard

4. **Authentication**
   - Open in Telegram → auth succeeds → user data displayed

5. **Power-Ups**
   - Collect power-up → activate → effect applies → expires

6. **Character Selection**
   - Open character modal → select character → character persists → affects gameplay

**Test Coverage Goals:**
- Unit tests: 80%+ coverage
- Integration tests: Key user flows
- E2E tests: Critical paths

**CI/CD Integration:**
- Run tests on every PR
- Block merges if tests fail
- Automated visual regression testing

**Acceptance Criteria:**
- [ ] E2E tests pass consistently
- [ ] Tests run in CI pipeline
- [ ] Visual regression tests catch UI changes
- [ ] Performance tests catch regressions

---

## Feature Prioritization Matrix

| Feature | Impact | Effort | Priority | Milestone |
|---------|--------|--------|----------|-----------|
| Character Animations | High | Medium | P0 | M2 |
| Shot Mechanics | High | High | P0 | M2 |
| Enhanced Scoring | High | Low | P0 | M2 |
| Telegram Auth | High | Medium | P0 | M3 |
| WebApp Integration | High | Low | P0 | M3 |
| Haptic Feedback | Medium | Low | P1 | M3 |
| Multiple Characters | Medium | High | P1 | M4 |
| Power-Ups | High | Medium | P1 | M4 |
| Daily Challenges | Medium | Medium | P1 | M4 |
| Achievements | Low | High | P2 | M4 |
| Friend Leaderboard | Medium | Medium | P1 | M5 |
| Challenge Friends | High | Medium | P1 | M5 |
| IAP | High | High | P1 | M5 |
| Reward Ads | Medium | Medium | P2 | M5 |
| Referral System | Medium | Low | P2 | M5 |
| Performance Optimization | High | Medium | P0 | M6 |
| Error Tracking | High | Low | P0 | M6 |
| Localization | Medium | Medium | P1 | M6 |
| E2E Testing | Medium | High | P2 | M6 |

**Priority Definitions:**
- **P0:** Must-have, blocking
- **P1:** Important, plan to include
- **P2:** Nice-to-have, may defer

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Owner:** Product Team
**Next Review:** After Milestone 2 completion
