# 🚀 Railway Deployment Checklist

## Current Status
- ✅ Code is correct (all API calls use API_URL from config.js)
- ✅ config.js explicitly returns Railway URL: https://web-production-c80fe.up.railway.app
- ✅ Local backend works: http://127.0.0.1:8000/health ✅
- ❓ Railway backend status: UNKNOWN (need to verify)

## Required Steps in Railway Dashboard

### Step 1: Go to Railway Dashboard
1. Open: https://railway.app
2. Select your **2KNOW** project
3. Click the **web** service

### Step 2: Set Environment Variables (CRITICAL!)
1. Click the **Variables** tab
2. **ADD or UPDATE** these variables:
   
   ```
   ALLOWED_ORIGINS=https://web-production-c80fe.up.railway.app,http://127.0.0.1:8000
   JWT_ALGORITHM=HS256
   ENVIRONMENT=production
   ```

3. **VERIFY** these are already set:
   - `JWT_SECRET_KEY` - should be your secret key
   - `SERPER_API_KEY` - if using search features (optional)
   - `GOOGLE_CLIENT_ID` - if using OAuth (optional)
   - `GOOGLE_CLIENT_SECRET` - if using OAuth (optional)

4. Click **Save** (auto-save may apply immediately)

### Step 3: Trigger Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment (should have a green checkmark)
3. Click the **⋯ (three dots)** button
4. Select **Redeploy**
5. Wait 60-120 seconds for build to complete

### Step 4: Verify Deployment
1. Check **Deployments** tab - latest should show "✅ Success"
2. Look at **Logs** tab - should see:
   ```
   🚀 Starting 2KNOW Market Trend Predictor API
   📁 Database: sqlite:///./2know.db
   🌐 Server running at: 0.0.0.0:PORT
   ```

3. Test health endpoint:
   ```
   curl https://web-production-c80fe.up.railway.app/health
   ```
   Should respond with: `{"status":"ok","service":"2KNOW API","timestamp":"..."}`

### Step 5: Test Frontend
1. Visit: https://web-production-c80fe.up.railway.app/
2. Open browser console (F12)
3. Should see:
   - ✅ `🔌 API Configuration loaded: https://web-production-c80fe.up.railway.app`
   - ✅ `✅ Backend health: ok`
4. No errors about localhost or connection refused

### Step 6: Test User Flow
1. Register new account
2. Should see success message
3. Login with credentials
4. Should see dashboard
5. Search for a trend
6. Should get results

## Troubleshooting

### If backend still not reachable:
**Check in Railway:**
- [ ] Go to **Logs** tab - any errors?
- [ ] Go to **Variables** tab - is `ALLOWED_ORIGINS` set?
- [ ] Go to **Status** - is it "Running"?
- [ ] Try manual **Redeploy** again

### If frontend shows "Backend API is not reachable":
- [ ] Open **DevTools** (F12) → **Network** tab
- [ ] Check requests to `/health` - what status code?
- [ ] If 403/CORS error: `ALLOWED_ORIGINS` not set in Railway
- [ ] If 404: endpoint not found (shouldn't happen)
- [ ] If connection refused: backend not running on Railway

### If you see localhost errors in console:
- [ ] Hard refresh: `Ctrl+Shift+R`
- [ ] Clear browser cache completely
- [ ] Check if `config.js?v=2` is being loaded (Network tab)
- [ ] If still seeing localhost: browser has old cached version

## Code Status Summary

**config.js:**
- Returns explicit Railway URL for production
- Returns localhost URL for local dev
- Exported as `API_URL` constant

**auth.js:**
- All API calls use `${API_URL}` prefix
- Health check at startup uses `${API_URL}/health`
- Profile fetch uses `${API_URL}/auth/profile`

**dashboard.js:**
- All trend searches use `${API_URL}/trends/...`

**main.py:**
- CORS middleware reads `ALLOWED_ORIGINS` env var
- Accepts requests from Railway domain if env var is set

## Quick Summary

**The code is correct.** The frontend will automatically work on both:
- ✅ Local: `http://127.0.0.1:8000` (detected by config.js)
- ✅ Railway: `https://web-production-c80fe.up.railway.app` (detected by config.js)

**BUT** the backend needs to accept requests from the Railway domain. This requires setting `ALLOWED_ORIGINS` in Railway Variables.

**If ALLOWED_ORIGINS is not set in Railway, the backend will reject all CORS requests and the frontend won't work.**
