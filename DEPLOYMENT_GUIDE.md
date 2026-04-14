# 🚀 AI Study Assistant - Free Deployment Guide

## Overview
Deploy your full-stack MERN application completely free using:
- **Frontend**: Vercel (React hosting)
- **Backend**: Railway (Node.js hosting)
- **Database**: MongoDB Atlas (free tier)

## Step-by-Step Deployment

### 1. GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-study-assistant.git
git push -u origin main
```

### 2. MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 (free) cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
5. Update in `.env.production`

### 3. Deploy Backend to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select `ai-study-assistant` repo
5. Add environment variables:
   - `PORT=5000`
   - `MONGODB_URI=your_connection_string`
   - `JWT_SECRET=your_secret`
   - `GROQ_API_KEY=your_api_key`
   - `NODE_ENV=production`
6. Railway auto-deploys
7. Copy the generated Railway URL (backend URL)

### 4. Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import project → Select `ai-study-assistant`
4. Framework: `React`
5. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-url/api`
6. Deploy
7. Get Vercel URL (frontend URL)

### 5. Update Configuration
Update CORS in Backend:
- Add your Vercel URL to `FRONTEND_URL` in railway environment
- Restart backend

Update Frontend API:
- Set `REACT_APP_API_URL` to your Railway backend URL in Vercel

### 6. Test Deployment
1. Visit: `https://your-app.vercel.app`
2. Sign up / Login
3. Upload PDF
4. Chat with AI
5. Generate Quiz, Summary, Flashcards

## Important Notes

### File Uploads
- Railway provides ephemeral storage (files deleted on redeploy)
- **Solution**: Use free Cloudinary for storage
  1. Go to https://cloudinary.com (free tier)
  2. Get API credentials
  3. Update backend to use Cloudinary
  4. Files persist in cloud

### Environment Variables
**Backend (Railway):**
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Frontend (Vercel):**
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## Free Tier Limits
| Service | Free Tier | Limit |
|---------|-----------|-------|
| **MongoDB** | 512MB | Per database |
| **Railway** | 500 hours/month | ~$5/month if exceeded |
| **Vercel** | Unlimited | Deployments, bandwidth |
| **Groq API** | Free tier | Rate limits apply |

## Deployment Checklist
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated for Vercel URL
- [ ] File upload solution (Cloudinary) configured
- [ ] All features tested on production

## Support
For issues:
1. Check Railway & Vercel deployment logs
2. Verify environment variables
3. Check MongoDB connection
4. Review CORS settings

Happy Deploying! 🎉
