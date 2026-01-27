# Railway Deployment Setup Instructions

## Current Status
- **App URL**: https://web-production-c80fe.up.railway.app/
- **GitHub**: murekani/2KNOW (connected to Railway)
- **Database**: SQLite (local to container)
- **Latest Push**: Fix duplicate health_check, add ALLOWED_ORIGINS

## Critical Environment Variables Required in Railway

To make the frontend work properly on Railway, you MUST set these environment variables in the Railway dashboard:

### Required Variables (SET IN RAILWAY DASHBOARD):

1. **ALLOWED_ORIGINS**
   - Value: `https://web-production-c80fe.up.railway.app,http://127.0.0.1:8000`
   - Why: Frontend CORS requests need this. Railway domain must be included.

2. **JWT_SECRET_KEY** (Already set)
   - Current: Set in your Railway env vars
   - Note: This is auto-loaded from .env.example in code

3. **JWT_ALGORITHM** (Already set)
   - Current: `HS256`

4. **SERPER_API_KEY** (Optional, for search features)
   - Add if you want search functionality

5. **GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET** (Optional)
   - Add if you want Google OAuth

6. **DATABASE_URL** (Optional, for PostgreSQL)
   - Default: SQLite (works fine for testing)
   - For production: Add Railway PostgreSQL addon and set this

7. **ENVIRONMENT**
   - Set to: `production` (optional, for better logging)

## Step-by-Step Setup in Railway Dashboard

1. Go to **https://railway.app** → Your Project → 2KNOW
2. Click the **Settings** tab
3. Find **Environment Variables**
4. ADD THE VARIABLES BELOW:

```
ALLOWED_ORIGINS=https://web-production-c80fe.up.railway.app,http://127.0.0.1:8000
JWT_SECRET_KEY=<your-secret-key>
JWT_ALGORITHM=HS256
ENVIRONMENT=production
```

5. Click "Save"
6. Click "Redeploy" to apply changes

## How It Works

### Frontend Flow:
1. Browser loads https://web-production-c80fe.up.railway.app/
2. FastAPI serves `index.html` from `backend/app/static/`
3. `config.js` detects production domain and sets `API_URL` to `https://web-production-c80fe.up.railway.app`
4. `auth.js` calls `/auth/register` and `/auth/login` with CORS headers
5. FastAPI CORS middleware checks if origin is in `ALLOWED_ORIGINS` and allows the request

### If "Backend API is not reachable" appears:
- **Cause 1**: ALLOWED_ORIGINS not set or doesn't include Railway domain
  - **Fix**: Add `https://web-production-c80fe.up.railway.app` to ALLOWED_ORIGINS in Railway dashboard
  
- **Cause 2**: Frontend config.js not detecting domain correctly
  - **Fix**: Open browser console (F12), check what `API_URL` is set to
  - **Should be**: `https://web-production-c80fe.up.railway.app`
  
- **Cause 3**: Backend endpoint not working
  - **Fix**: Test with `curl https://web-production-c80fe.up.railway.app/health`
  - **Expected**: `{"status":"ok","service":"2KNOW API","timestamp":"..."}`

## Testing Checklist

After setting environment variables in Railway:

- [ ] 1. Visit https://web-production-c80fe.up.railway.app/
- [ ] 2. See login page (index.html loads)
- [ ] 3. Open browser console (F12 → Console tab)
- [ ] 4. Check for errors (should see `API Configuration loaded: https://web-production-c80fe.up.railway.app`)
- [ ] 5. Try registering a new account
- [ ] 6. Should see success and redirect to login or dashboard
- [ ] 7. Try logging in
- [ ] 8. Should see dashboard with trend search functionality

## Optional: Add Database (PostgreSQL)

For production data persistence:

1. In Railway dashboard, click **+ Create**
2. Select **PostgreSQL**
3. Go to PostgreSQL service → Copy DATABASE_URL
4. Add to 2KNOW environment: `DATABASE_URL=<postgresql-url>`
5. Redeploy

## Troubleshooting

### "Cannot GET /" error
- Backend not running
- Check Railway logs: Project → Deployments tab
- Look for errors in build output

### "Backend API is not reachable" (frontend loads but can't call API)
- Set ALLOWED_ORIGINS in Railway dashboard to include `https://web-production-c80fe.up.railway.app`
- Check browser console for exact error

### /health returns 500 error
- Database tables not initialized
- Railway logs should show error
- May need to redeploy after setting DATABASE_URL

### Slow startup
- First deployment slower (pip install)
- Subsequent deployments faster (layer caching)
- Normal startup: 30-60 seconds
