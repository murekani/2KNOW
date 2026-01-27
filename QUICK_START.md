# 🚀 Quick Start - Get 2KNOW Running on Railway

## ✅ What's Done
- Fixed all code issues (duplicate endpoints, CORS setup)
- Frontend correctly detects production domain
- Backend serves frontend + API
- Docker and deployment configs ready

## ⚠️ What You Need to Do (5 minutes)

### Step 1: Configure Railway Environment Variables

1. Open **https://railway.app** in your browser
2. Go to your **2KNOW** project
3. Click the **web** service
4. Go to **Settings** → **Variables**
5. **ADD** these variables (don't delete existing ones):

```
ALLOWED_ORIGINS=https://web-production-c80fe.up.railway.app,http://127.0.0.1:8000
JWT_ALGORITHM=HS256
ENVIRONMENT=production
```

6. Make sure these are ALREADY set (should be):
   - `JWT_SECRET_KEY` - your secret key
   - `SERPER_API_KEY` - if using search features
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - if using OAuth

7. Click **Save** (or let it auto-save)

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait 60-90 seconds for rebuild/restart

### Step 3: Test

1. Visit: **https://web-production-c80fe.up.railway.app/**
2. Should see: Login page with email/password fields
3. Open browser console (**F12 key**)
   - Should see: `🔌 API Configuration loaded: https://web-production-c80fe.up.railway.app`
   - If you see localhost URL instead, frontend domain detection failed
4. Try registering a test account (any email/password)
5. Should see success message or redirect to dashboard
6. Try logging in
7. Search for a trend (e.g., "Bitcoin")

## ❌ If It Doesn't Work

### Issue: "Backend API is not reachable"
**Fix**: In Railway Variables, make sure `ALLOWED_ORIGINS` includes exactly: `https://web-production-c80fe.up.railway.app`

### Issue: Login page doesn't load at all
**Fix**: 
1. Check Railway Deployments log for errors
2. Make sure latest code was deployed
3. Test health check: https://web-production-c80fe.up.railway.app/health
   - Should show: `{"status":"ok","service":"2KNOW API","timestamp":"..."}`

### Issue: Trends search shows error
**Fix**: 
1. Make sure `SERPER_API_KEY` is set in Railway Variables (if using Serper service)
2. Check browser console for exact error message
3. Check Railway logs

## 📋 Expected Results

### When Everything Works:
- ✅ Frontend loads at Railway URL
- ✅ Can register new users
- ✅ Can log in
- ✅ Can search trends
- ✅ Results appear on dashboard

### What Happens Behind Scenes:
1. Browser requests https://web-production-c80fe.up.railway.app/
2. FastAPI serves index.html from static folder
3. index.html loads config.js (detects production domain)
4. User fills login form and clicks submit
5. auth.js sends request to `https://web-production-c80fe.up.railway.app/auth/login`
6. CORS middleware checks if origin is allowed (you set ALLOWED_ORIGINS)
7. Backend processes login, returns JWT token
8. Frontend stores token and shows dashboard
9. User can now search trends using protected /api/trends endpoint

## 🔐 Important Security Notes

- **Never commit .env file** (it's in .gitignore - good!)
- **Keep JWT_SECRET_KEY secret** (don't share it)
- **Use strong passwords** for production
- **For production database**: Use Railway PostgreSQL addon instead of SQLite

## 📞 Quick Support

If you need to debug:

1. Check Railway logs (Deployments → Latest → Logs tab)
2. Check browser console errors (F12)
3. Test health endpoint: `https://web-production-c80fe.up.railway.app/health`
4. Check ALLOWED_ORIGINS in Railway Variables

## 📚 Detailed Guides

- Full setup guide: See `RAILWAY_SETUP.md`
- Deployment summary: See `DEPLOYMENT_FIXES_SUMMARY.md`
- Previous notes: See `RAILWAY_DEPLOYMENT.md`

---

**Status**: 🟢 Code ready, waiting for Railway environment variables
**Next Action**: Set ALLOWED_ORIGINS in Railway dashboard → Redeploy → Test
