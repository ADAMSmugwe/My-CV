# 🚀 Netlify Deployment Guide

## Step 1: Prepare Your Repository

Make sure all your changes are committed to Git:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## Step 2: Deploy to Netlify

### Option A: Deploy via GitHub (Recommended)

1. **Go to [Netlify](https://netlify.com)** and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your CV repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click **"Deploy site"**

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Deploy
netlify deploy --prod
```

## Step 3: Configure Environment Variables

Your Gemini API key needs to be added to Netlify:

1. Go to your site in Netlify dashboard
2. Click **"Site configuration"** → **"Environment variables"**
3. Click **"Add a variable"**
4. Add:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key (from Google AI Studio)
5. Click **"Save"**

**Important:** After adding environment variables, you need to trigger a new deploy:
- Go to **"Deploys"** → Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## Step 4: Custom Domain (Optional)

### Add Your Own Domain:
1. Go to **"Domain management"**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, takes ~1 hour)

### Use Netlify Subdomain:
Your site gets a free subdomain like: `your-cv-name.netlify.app`

You can customize it:
1. Go to **"Site configuration"** → **"Domain management"**
2. Click **"Options"** → **"Edit site name"**
3. Choose a unique name

## Build Settings (Auto-configured)

Netlify will use these settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: Latest LTS (automatic)

## Deployment Features

✅ **Automatic deploys** - Every push to main branch triggers deployment
✅ **Deploy previews** - Pull requests get preview URLs
✅ **Instant rollback** - Revert to previous deploys in one click
✅ **CDN hosting** - Fast global distribution
✅ **Free SSL** - HTTPS automatic
✅ **Form handling** - Built-in form support
✅ **Analytics** - Basic analytics included (free tier)

## Troubleshooting

### Build Fails
- Check Netlify build logs for errors
- Verify all dependencies are in `package.json`
- Make sure Node version is compatible (v18+ recommended)

### Environment Variables Not Working
- Variables must start with `VITE_` for Vite projects
- Trigger a new deploy after adding variables
- Check variable names exactly match your code

### 404 Errors on Page Refresh
- This should be fixed by the redirect rule in `netlify.toml`
- Verify the redirect is working: Check "Redirect rules" in Netlify dashboard

### Chatbot Not Working
- Check browser console for errors
- Verify `VITE_GEMINI_API_KEY` is set in Netlify environment variables
- Make sure you triggered a redeploy after adding the variable

## Monitoring Your Site

After deployment:
- **Site URL**: Check your deploy log for the URL
- **Deploy status**: Green = success, Red = failed
- **Analytics**: View traffic in Netlify dashboard
- **Build time**: Typically 1-2 minutes

## Cost

**Free Tier Includes:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS on all sites
- Continuous deployment

Perfect for a personal CV website! 🎉

## Next Steps

1. ✅ Deploy your site
2. ✅ Add environment variables
3. ✅ Test the live site
4. ✅ Share your CV with the world!
5. (Optional) Add custom domain
6. (Optional) Set up Google Analytics

Your CV is now live and professional! 🚀
