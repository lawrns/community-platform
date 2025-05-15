# Deployment Guide for Community Frontend

This guide covers how to deploy the Community frontend application to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (you can sign up with your GitHub account)

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
# If you haven't already initialized a Git repository
git init
git add .
git commit -m "Initial commit for deployment"

# Create a new repository on GitHub and push to it
git remote add origin https://github.com/yourusername/communityv2-frontend.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `frontend` (if your Next.js app is in a subdirectory)
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Environment Variables:
   Add the following environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pemzriizvnhxwuyewyee.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXpyaWl6dm5oeHd1eWV3eWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNjgyOTMsImV4cCI6MjA2Mjc0NDI5M30.mTgVeJR7VNjK3I1X9jvSeuDGOb04w9bULksM-yiQs5Y
   NEXT_PUBLIC_API_URL=https://communityv2-backend.vercel.app
   NEXT_PUBLIC_WS_URL=wss://communityv2-backend.vercel.app
   NEXT_PUBLIC_AUTH_PROVIDER=supabase
   NEXT_PUBLIC_FEATURE_LIVE_CHAT=false
   NEXT_PUBLIC_FEATURE_COMMUNITY_EVENTS=false
   NEXT_PUBLIC_FEATURE_AI_ASSISTANT=true
   NEXT_PUBLIC_FEATURE_RECOMMENDATION_ENGINE=true
   NEXT_PUBLIC_ANALYTICS_PROVIDER=none
   NEXT_PUBLIC_DEFAULT_THEME=system
   ```

6. Click "Deploy"

### 3. Verify the Deployment

1. Once deployed, Vercel will provide you with a URL (e.g., `https://communityv2-frontend.vercel.app`)
2. Visit the URL to ensure your site is working correctly
3. Test functionality to verify the integration with the backend API

### 4. Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your custom domain and follow the instructions to configure DNS

## Troubleshooting

If you encounter issues with your deployment:

1. Check the Vercel build logs for errors
2. Verify your environment variables are set correctly
3. Ensure your backend API is deployed and accessible
4. Test with `next build` locally to catch any issues before deploying

## Continuous Deployment

Vercel will automatically redeploy your application when you push changes to your GitHub repository. You can also configure preview deployments for pull requests.