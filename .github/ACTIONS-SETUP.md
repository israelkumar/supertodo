# GitHub Actions CI/CD Setup Guide

This guide explains how to configure GitHub Actions for automatic testing and deployment to Netlify.

## Overview

The CI/CD pipeline includes:
1. **Test**: Runs 83 unit tests on every push
2. **Build**: Creates production build
3. **Deploy**: Automatically deploys to Netlify (master/main branch only)
4. **Lighthouse**: Runs performance checks after deployment

## Prerequisites

- GitHub repository with Actions enabled
- Netlify account with deployed site
- Admin access to repository settings

## Setup Instructions

### Step 1: Get Netlify Credentials

#### Get NETLIFY_AUTH_TOKEN:
1. Go to https://app.netlify.com/user/applications
2. Click "New access token"
3. Give it a name (e.g., "GitHub Actions")
4. Click "Generate token"
5. **Copy the token** (you won't see it again!)

#### Get NETLIFY_SITE_ID:
1. Go to your Netlify site dashboard
2. Go to "Site settings"
3. Scroll to "Site information"
4. Copy the **Site ID** (e.g., `abc12345-6789-def0-1234-56789abcdef0`)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these two secrets:

**Secret 1:**
- Name: `NETLIFY_AUTH_TOKEN`
- Value: [Paste your Netlify auth token]

**Secret 2:**
- Name: `NETLIFY_SITE_ID`
- Value: [Paste your Netlify site ID]

### Step 3: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions", select:
   - ✅ Allow all actions and reusable workflows
3. Under "Workflow permissions", select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
4. Click **Save**

### Step 4: Test the Workflow

#### Option 1: Push a commit
```bash
# Make any change
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: trigger CI/CD pipeline"
git push origin master
```

#### Option 2: Manually trigger
1. Go to **Actions** tab in GitHub
2. Select "CI/CD Pipeline"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Step 5: Monitor the Pipeline

1. Go to **Actions** tab in your repository
2. Click on the running workflow
3. You'll see 4 jobs:
   - ✅ **Test**: Runs unit tests (~30s)
   - ✅ **Build**: Creates production build (~20s)
   - ✅ **Deploy**: Deploys to Netlify (~30s)
   - ✅ **Lighthouse**: Performance check (~1min)

## Workflow Triggers

### Automatic Triggers:
- **Push to master/main**: Full pipeline (test → build → deploy → lighthouse)
- **Push to feature branch**: Test and build only (no deploy)
- **Pull request**: Test and build only (no deploy)

### Manual Trigger:
- Go to Actions → CI/CD Pipeline → Run workflow

## What Happens on Each Push

### Feature Branches (e.g., `001-daily-task-organizer`)
1. ✅ Tests run
2. ✅ Build succeeds
3. ⏭️ Deploy skipped (not master/main)

### Master/Main Branch
1. ✅ Tests run (83 unit tests)
2. ✅ Build succeeds (optimized production build)
3. 🚀 Deploy to Netlify (live in ~30 seconds)
4. 📊 Lighthouse performance check

## Pipeline Status Badges

Add this to your README.md:

```markdown
[![CI/CD](https://github.com/israelkumar/supertodo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/israelkumar/supertodo/actions/workflows/ci-cd.yml)
```

## Troubleshooting

### Tests Failing
- Check test output in Actions logs
- Run `npm test` locally first
- Ensure all tests pass before pushing

### Build Failing
- Check if `npm run build` works locally
- Verify Node.js version (should be 18+)
- Check for missing dependencies

### Deploy Failing
- Verify `NETLIFY_AUTH_TOKEN` is correct
- Verify `NETLIFY_SITE_ID` is correct
- Check Netlify dashboard for deployment logs
- Ensure secrets are added to repository settings

### Lighthouse Failing
- This is informational only (won't block deployment)
- Check performance scores
- Review recommendations for optimization

## Advanced Configuration

### Customize Test Coverage Threshold

Edit `.github/workflows/ci-cd.yml`:

```yaml
- name: Check coverage threshold
  run: |
    npm run test:coverage
    # Add coverage threshold check here
```

### Deploy to Multiple Environments

Add staging deployment:

```yaml
deploy-staging:
  if: github.ref == 'refs/heads/staging'
  # Add staging deployment steps
```

### Add Slack Notifications

Install Slack GitHub App and add:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Cost

GitHub Actions is free for public repositories!

- ✅ **Public repos**: Unlimited minutes
- ✅ **Private repos**: 2,000 minutes/month free

Our pipeline uses ~2-3 minutes per run.

## Security Best Practices

- ✅ Never commit secrets to code
- ✅ Use repository secrets for sensitive data
- ✅ Limit secret access to required workflows only
- ✅ Rotate tokens periodically (every 90 days)
- ✅ Use least-privilege access tokens

## Support

If you encounter issues:
1. Check Actions logs for error messages
2. Review Netlify deployment logs
3. Test locally: `npm test && npm run build`
4. Create an issue on GitHub

---

**CI/CD Setup Complete!** 🎉

Every push to master will now automatically:
1. ✅ Run tests
2. 🏗️ Build the app
3. 🚀 Deploy to production
4. 📊 Check performance

No manual deployment needed!
