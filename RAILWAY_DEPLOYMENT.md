# 2KNOW Deployment Guide for Railway

## ✅ Deployment Checklist

Your project has been prepared for Railway deployment! Here's what was done:

### ✨ Changes Made:
- ✅ **Dynamic API URLs** - Frontend now uses `API_URL` config instead of hardcoded `localhost`
- ✅ **Environment-based server configuration** - Backend reads `HOST` and `PORT` from environment
- ✅ **CORS updated** - Backend accepts Railway domain via `ALLOWED_ORIGINS` env var
- ✅ **Procfile created** - Railway knows how to start your app
- ✅ **Dockerfile created** - For containerized deployment
- ✅ **Static files serving** - Backend serves frontend CSS/JS/Assets
- ✅ **Config files created** - `.env.example` and `railway.json`

---

## 🚀 Quick Start Deployment

### Step 1: Create Railway Account
- Go to https://railway.app
- Sign up (via GitHub recommended)

### Step 2: Create New Project
- Click "New Project"
- Select "Deploy from GitHub"
- Connect your repository

### Step 3: Configure Environment Variables
In the Railway dashboard, set these variables:

```
ENVIRONMENT=production
JWT_SECRET_KEY=<generate-a-new-secret-key>
SERPER_API_KEY=<your-serper-api-key>
ALLOWED_ORIGINS=https://<your-railway-domain>.railway.app
```

To generate a new JWT_SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Add PostgreSQL Database (Optional but Recommended)
1. In your Railway project, click "+ New Service"
2. Select "PostgreSQL"
3. Railway will automatically set `DATABASE_URL` environment variable

### Step 5: Deploy
- Railway automatically deploys when you push to main branch
- Check deployment logs in Railway dashboard

---

## 🔧 Configuration Details

### Environment Variables

**Required:**
- `JWT_SECRET_KEY` - For token encryption (generate new one for production)
- `ENVIRONMENT=production` - Switches to production mode

**Important for Railway:**
- `ALLOWED_ORIGINS` - Your Railway domain (will be auto-set in frontend)
- `DATABASE_URL` - Auto-set by Railway if you add PostgreSQL

**Optional:**
- `SERPER_API_KEY` - For Google Trends (get from https://serper.dev)

### Database
- **Local development:** SQLite (default)
- **Production (Railway):** PostgreSQL recommended
  - Add PostgreSQL service in Railway dashboard
  - Railway auto-generates DATABASE_URL

### Frontend Configuration
The frontend automatically detects the environment:
- **Local:** Uses `http://127.0.0.1:8000`
- **Production:** Uses current domain (Railway URL)

See `frontend/js/config.js` for details.

---

## 📊 Project Structure

```
2KNOW/
├── backend/
│   ├── run.py           (Entry point - reads PORT from env)
│   ├── requirements.txt  (Dependencies)
│   └── app/
│       ├── main.py      (FastAPI app - serves frontend & API)
│       ├── auth.py      (Authentication)
│       ├── models.py    (Database models)
│       └── services/
├── frontend/
│   ├── dashboard.html   (Main app)
│   ├── index.html       (Login page)
│   ├── js/
│   │   ├── config.js    (API URL configuration)
│   │   ├── auth.js      (Authentication)
│   │   └── dashboard.js (App logic)
│   ├── css/
│   └── assets/
├── Dockerfile           (Docker configuration)
├── Procfile            (Process definition)
├── railway.json        (Railway config)
└── .env.example        (Environment variables template)
```

---

## 🔍 Connectivity Verification

### ✅ Frontend ↔ Backend
- Backend API runs on dynamic port (Railway assigns)
- Frontend reads from `API_URL` in `config.js`
- All requests to `/auth/*` and `/trends/*` routes
- CORS properly configured for Railway domain

### ✅ Database Connection
- SQLAlchemy ORM handles connections
- Read `DATABASE_URL` from environment
- PostgreSQL auto-configured on Railway

### ✅ Static Files
- Frontend served at `/` (login)
- Dashboard available at `/app`
- CSS at `/css/*`
- JS at `/js/*`
- Assets at `/assets/*`

---

## 🐛 Troubleshooting

### Issue: "Cannot reach API"
**Solution:** Check `ALLOWED_ORIGINS` includes your Railway domain

### Issue: "Static files not found (404)"
**Solution:** Ensure frontend folder structure matches:
```
frontend/
├── css/
├── js/
├── assets/
├── dashboard.html
└── index.html
```

### Issue: "Database connection error"
**Solution:** 
- Check DATABASE_URL is set in Railway
- If using PostgreSQL, verify service is running
- Check credentials in DATABASE_URL string

### Issue: "JWT errors"
**Solution:** Regenerate JWT_SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📱 Accessing Your App

After deployment:
1. Your Railway domain: `https://<your-project>.railway.app`
2. Login page: `https://<your-project>.railway.app/`
3. Dashboard: `https://<your-project>.railway.app/app`
4. API Docs: `https://<your-project>.railway.app/docs`

---

## 🛡️ Security Checklist

Before going live:
- [ ] Change JWT_SECRET_KEY to a new value
- [ ] Set SERPER_API_KEY if using real data
- [ ] Use PostgreSQL for production database
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Review ALLOWED_ORIGINS - only include your domain
- [ ] Test login/registration flow
- [ ] Check API endpoints are protected with JWT

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- FastAPI Docs: https://fastapi.tiangolo.com
- For issues: Check Railway deployment logs in dashboard

Good luck with your deployment! 🚀
