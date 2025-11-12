# Sound Assets for Hockey Tapper

This directory contains audio files for game sound effects.

## Required Audio Files

The following audio files are needed for the game:

### 1. **shoot.mp3**
- **Purpose:** Played when puck is shot
- **Duration:** 0.3-0.5 seconds
- **Characteristics:** Sharp, crisp "whoosh" or hockey stick hitting puck sound
- **Volume:** Medium (0.6)
- **Recommended sources:**
  - https://freesound.org/ (search: "hockey stick", "puck hit", "swoosh")
  - https://mixkit.co/free-sound-effects/game/
  - https://pixabay.com/sound-effects/

### 2. **goal.mp3**
- **Purpose:** Played when target is hit (goal scored)
- **Duration:** 0.5-1.0 seconds
- **Characteristics:** Positive, celebratory sound (bell, chime, success jingle)
- **Volume:** Medium-high (0.7)
- **Recommended sources:**
  - Freesound: "success", "goal", "achievement"
  - Mixkit: "game win", "level complete"

### 3. **miss.mp3**
- **Purpose:** Played when shot misses all targets
- **Duration:** 0.3-0.5 seconds
- **Characteristics:** Subtle negative sound (soft "thud", "miss", dampened tone)
- **Volume:** Medium-low (0.5)
- **Recommended sources:**
  - Freesound: "miss", "fail soft", "negative soft"
  - Ensure it's not too harsh/punishing

### 4. **combo.mp3**
- **Purpose:** Played when combo multiplier increases (3x, 5x, 10x)
- **Duration:** 0.5-0.8 seconds
- **Characteristics:** Exciting, high-energy sound (power-up, level-up, fanfare)
- **Volume:** High (0.8)
- **Recommended sources:**
  - Freesound: "power up", "combo", "multiplier"
  - Mixkit: "game bonus"

### 5. **tick.mp3**
- **Purpose:** Played for timer countdown (last 5-10 seconds)
- **Duration:** 0.1-0.2 seconds
- **Characteristics:** Short, subtle tick or beep
- **Volume:** Low (0.4)
- **Recommended sources:**
  - Freesound: "clock tick", "timer beep", "ui click"
  - Keep it non-intrusive

## Audio Specifications

### Technical Requirements:
- **Format:** MP3 (best browser compatibility)
- **Bitrate:** 128-192 kbps (balance quality and file size)
- **Sample Rate:** 44.1 kHz
- **Channels:** Mono or Stereo (mono preferred for smaller file size)
- **Max File Size:** ~50KB per file (target total: <250KB for all sounds)

### File Naming:
- Use exact names as listed above
- Lowercase, no spaces
- `.mp3` extension

## Sourcing Tips

### Free Sound Effect Sites:
1. **Freesound.org** (best for variety, requires attribution for some)
2. **Mixkit.co** (high quality, royalty-free)
3. **Pixabay.com/sound-effects** (CC0, no attribution required)
4. **Zapsplat.com** (large library, free with account)
5. **Soundbible.com** (public domain + royalty-free)

### License Considerations:
- ✅ Public domain (CC0)
- ✅ Creative Commons Attribution (CC BY)
- ✅ Royalty-free (check terms)
- ❌ Avoid copyrighted sounds without license

### Editing Tools (if needed):
- **Audacity** (free, cross-platform) - trim, normalize, convert
- **Online Audio Cutter** (browser-based) - quick edits
- **FFmpeg** (command line) - batch conversion

## Quick Setup Command

After downloading/creating audio files, verify they're in place:

```bash
ls -lh /Users/dmitrystakhin/hockey_tapper/apps/web/public/assets/sounds/
```

Expected output:
```
shoot.mp3
goal.mp3
miss.mp3
combo.mp3
tick.mp3
```

## Testing

Once files are added, test in the game:
1. Start dev server: `npm run web`
2. Open browser console
3. Look for: `[useSound] All sounds preloaded successfully`
4. Play game and verify sounds trigger correctly

## Temporary Placeholder (Development)

If you want to test the sound system before sourcing real audio:
1. Create silent placeholder MP3s (1 second silence)
2. Or use a simple online tone generator to create beeps
3. Replace with real sounds later

---

**Status:** ⚠️ Audio files NOT YET ADDED
**Action Required:** Source and add 5 MP3 files to this directory
