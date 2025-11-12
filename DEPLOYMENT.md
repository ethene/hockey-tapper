# Deployment Guide - Hockey Tapper

This guide covers deploying the Hockey Tapper frontend application to Vercel or Netlify.

## Prerequisites

- Production build verified (✅ completed)
- All tests passing (✅ 222 tests passed)
- Git repository initialized

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers seamless Git integration and automatic deployments.

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Navigate to the web app directory
cd apps/web

# Deploy (first time will prompt for project setup)
vercel

# For production deployment
vercel --prod
```

#### Deploy via Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click "Add New Project"
4. Import your `hockey_tapper` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click "Deploy"

### Option 2: Netlify

Netlify provides similar CI/CD capabilities with additional features.

#### Deploy via Netlify CLI

```bash
# Install Netlify CLI globally (if not already installed)
npm install -g netlify-cli

# Navigate to the web app directory
cd apps/web

# Deploy (first time will prompt for project setup)
netlify deploy

# For production deployment
netlify deploy --prod
```

#### Deploy via Netlify Dashboard

1. Visit [netlify.com](https://netlify.com)
2. Sign in with your account
3. Click "Add new site" → "Import an existing project"
4. Connect your Git provider and select the repository
5. Configure:
   - **Base directory:** `apps/web`
   - **Build command:** `npm run build`
   - **Publish directory:** `apps/web/dist`
6. Click "Deploy site"

## Environment Configuration

### DEMO Mode (Current Setup)

The app is currently configured for DEMO mode with localStorage-based leaderboards. No environment variables are required.

**What works in DEMO mode:**
- Full game mechanics (tap, score, timer)
- Combo system and animations
- Local leaderboard (stored in browser)
- All visual effects and sounds

**Limitations:**
- Scores only persist in local browser
- No cross-device synchronization
- Leaderboard resets if localStorage is cleared

### Production Mode (Backend Integration)

To enable the backend API:

1. Set environment variable in your deployment platform:
   - **Vercel:** Project Settings → Environment Variables
   - **Netlify:** Site Settings → Environment Variables

2. Add variable:
   ```
   Name: VITE_API_BASE_URL
   Value: https://your-backend-api.com/api
   ```

3. Ensure your backend is deployed and accessible

4. Redeploy the frontend

## Post-Deployment Verification

After deployment, verify:

### ✅ Basic Functionality
- [ ] App loads without errors
- [ ] Game starts on tap
- [ ] 30-second timer counts down
- [ ] Score increments on each tap
- [ ] Game ends when timer reaches 0
- [ ] Modal shows final score

### ✅ Leaderboard (DEMO Mode)
- [ ] Leaderboard displays after game ends
- [ ] Scores are sorted correctly (highest first)
- [ ] Local scores persist across game sessions
- [ ] "Top 100" limit is enforced

### ✅ Game Mechanics
- [ ] Combo system works (multipliers appear)
- [ ] Character animations play smoothly
- [ ] Puck physics feel responsive
- [ ] Sound effects play correctly
- [ ] Particle effects render

### ✅ Performance
- [ ] Initial page load < 3 seconds
- [ ] No console errors
- [ ] Smooth 60fps animations
- [ ] Responsive on mobile devices

### ✅ Browser Testing
Test on multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (iOS Safari for mobile)
- [ ] Firefox

## Troubleshooting

### Build Fails

**Issue:** `npm run build` fails during deployment

**Solutions:**
- Ensure Node.js version matches local (20.x recommended)
- Check all dependencies are in `package.json`
- Verify no hardcoded paths in imports

### Assets Not Loading

**Issue:** Images/sounds return 404 errors

**Solutions:**
- Verify all assets are in `/apps/web/public/assets/`
- Check asset paths in components (should be `/assets/...`)
- Clear CDN cache if using one

### Routing Issues

**Issue:** Direct URL navigation returns 404

**Solutions:**
- Verify SPA redirect rules are configured:
  - Vercel: Check `vercel.json` rewrites
  - Netlify: Check `netlify.toml` redirects

### Performance Issues

**Issue:** App feels slow or laggy

**Solutions:**
- Enable compression (both platforms do this by default)
- Verify assets have cache headers (configured in `netlify.toml`)
- Check browser DevTools → Network tab for bottlenecks

## Next Steps

### Immediate
1. Deploy to your preferred platform
2. Run post-deployment verification checklist
3. Share the live URL with testers

### Future Enhancements
1. Connect backend API for persistent leaderboards
2. Integrate Telegram WebApp SDK
3. Add user authentication
4. Implement social sharing features

## Support

- **Build Issues:** Check the `/apps/web/dist/` folder locally first
- **Runtime Errors:** Use browser DevTools console
- **Deployment Platform Issues:** Consult platform documentation
  - [Vercel Docs](https://vercel.com/docs)
  - [Netlify Docs](https://docs.netlify.com)

---

**Generated:** 2025-11-12
**Status:** ✅ Ready to deploy
**Build Size:** ~63 KB (gzipped)
