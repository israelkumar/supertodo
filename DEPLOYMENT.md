# SuperTodo Deployment Guide

This guide explains how to deploy SuperTodo to various static hosting platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository initialized
- Production build tested locally

## Build for Production

```bash
# Install dependencies
npm install

# Run tests (optional but recommended)
npm run test:run

# Build for production
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### Option 1: Netlify (Recommended)

**Method A: Drag and Drop (Simplest)**

1. Build your project: `npm run build`
2. Go to [netlify.com](https://www.netlify.com/)
3. Drag the `dist/` folder to Netlify Drop
4. Your site is live!

**Method B: Git Integration (Automatic Deploys)**

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://www.netlify.com/) and sign up
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 (in Environment variables)
6. Click "Deploy site"

**Method C: Netlify CLI**

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build
npm run build

# Deploy (creates new site)
netlify deploy --prod --dir=dist

# Or link to existing site first
netlify link
netlify deploy --prod
```

### Option 2: Vercel

**Method A: Vercel CLI (Simplest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

**Method B: Git Integration**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/) and sign up
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel auto-detects Vite config:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

### Option 3: GitHub Pages

**Setup:**

1. Install gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add deploy script to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.js` base path:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',  // Replace with your repo name
     // ... rest of config
   })
   ```

**Deploy:**

```bash
# Build and deploy
npm run deploy
```

Your site will be available at: `https://your-username.github.io/your-repo-name/`

### Option 4: Cloudflare Pages

1. Push your code to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com/)
3. Sign up and connect your GitHub account
4. Click "Create a project"
5. Select your repository
6. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. Click "Save and Deploy"

### Option 5: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Post-Deployment Checklist

- [ ] Verify the site loads correctly
- [ ] Test creating tasks
- [ ] Test editing tasks
- [ ] Test deleting tasks (with confirmation)
- [ ] Test category management
- [ ] Test data export
- [ ] Test data import
- [ ] Test dark mode toggle
- [ ] Test on mobile devices
- [ ] Verify localStorage works
- [ ] Check browser console for errors

## Environment Variables

SuperTodo doesn't require environment variables for basic operation since it uses localStorage for data persistence.

For custom configurations, you can create a `.env` file (not included in version control):

```bash
# Example custom configuration
VITE_APP_NAME=SuperTodo
VITE_STORAGE_PREFIX=supertodo
```

## Custom Domain (Optional)

### Netlify Custom Domain

1. Go to your site's settings
2. Click "Domain management"
3. Click "Add custom domain"
4. Follow DNS setup instructions

### Vercel Custom Domain

1. Go to your project settings
2. Click "Domains"
3. Add your domain
4. Configure DNS records as instructed

## Continuous Deployment

Once set up with Git integration on Netlify, Vercel, or Cloudflare Pages:

1. Push changes to your `main` branch
2. Deployment triggers automatically
3. Site updates in 1-2 minutes

## Troubleshooting

### Build Fails

- Ensure Node.js version is 18+
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check build logs for specific errors

### Site Shows Blank Page

- Check browser console for JavaScript errors
- Verify `base` path in `vite.config.js` matches your hosting path
- Ensure all assets are loading (check Network tab)

### localStorage Not Persisting

- Verify browser allows localStorage (not in private/incognito mode)
- Check browser localStorage quota hasn't been exceeded
- Verify site is served over HTTPS (required by some browsers)

## Performance Optimization

The current build includes:
- ✅ Minification (esbuild)
- ✅ Code splitting
- ✅ Asset hashing for cache busting
- ✅ Modern ES2020 target
- ✅ Console removal in production
- ✅ Gzip compression (18.50 KB CSS, 30.17 KB JS)

For further optimization:
- Enable CDN on your hosting platform
- Configure custom caching headers
- Use image optimization if adding images
- Enable Brotli compression (better than gzip)

## Monitoring

Consider adding analytics (optional):
- Google Analytics
- Plausible Analytics
- Fathom Analytics

## Backup Strategy

Since SuperTodo uses localStorage:
1. Users should export their data regularly using the "Export Data" button
2. Encourage users to save backup JSON files
3. Consider adding automatic export reminders in future versions

## Support

For deployment issues:
- Check platform status pages
- Review platform documentation
- Check the project's issue tracker

---

## Quick Deploy Commands Reference

```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod

# GitHub Pages
npm run deploy

# Railway
railway up

# Manual (any static host)
npm run build
# Upload dist/ folder
```

---

**Note**: T115 - Deployment guide complete. Choose the platform that best fits your needs. Netlify and Vercel offer the smoothest experience with zero configuration.
