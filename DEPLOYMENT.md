# Deployment Guide: Vercel + Railway + MongoDB Atlas

## 🚀 Frontend Deployment (Vercel)

### 1. Prepare Frontend
1. Create a `.env` file in the root directory:
```env
VITE_API_URL=https://your-railway-app-url.railway.app/api
```

### 2. Deploy to Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add Environment Variables:
   - `VITE_API_URL`: `https://your-railway-app-url.railway.app/api`
7. Click "Deploy"

## 🔧 Backend Deployment (Railway)

### 1. Prepare Backend
1. Create a `.env` file in the `backend/` directory:
```env
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your_database
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-railway-app-url.railway.app/api/auth/google/callback
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
PORT=5000
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Add Environment Variables (same as above)
6. Deploy

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up/login and create a free cluster
3. Choose cloud provider (AWS/Google Cloud/Azure)
4. Select region closest to your users
5. Choose "M0 Free" tier
6. Click "Create"

### 2. Configure Database Access
1. Go to "Database Access" → "Add New Database User"
2. Create username and password
3. Select "Read and write to any database"
4. Click "Add User"

### 3. Configure Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### 4. Get Connection String
1. Go to "Clusters" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name

## 🔄 Update Environment Variables

### After Railway Deployment:
1. Get your Railway app URL (e.g., `https://your-app.railway.app`)
2. Update Vercel environment variable:
   - `VITE_API_URL`: `https://your-app.railway.app/api`
3. Update Railway environment variables:
   - `GOOGLE_CALLBACK_URL`: `https://your-app.railway.app/api/auth/google/callback`

## 🔐 Google OAuth Setup

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-app.railway.app/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback` (for development)
6. Copy Client ID and Client Secret

### 2. Update Environment Variables
- Add to Railway: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## 📧 Email Setup

### 1. Gmail App Password
1. Enable 2-factor authentication on your Gmail
2. Go to Google Account settings → Security
3. Generate App Password for "Mail"
4. Use this password in `EMAIL_PASS`

### 2. Update Environment Variables
- Add to Railway: `EMAIL_USER` and `EMAIL_PASS`

## 🚀 Final Steps

1. **Test your deployment**:
   - Frontend: `https://your-app.vercel.app`
   - Backend: `https://your-app.railway.app/api/health`

2. **Update CORS settings** in backend if needed:
   ```javascript
   app.use(cors({
     origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
     credentials: true
   }));
   ```

3. **Monitor your applications**:
   - Vercel: Check deployment logs and performance
   - Railway: Monitor logs and resource usage
   - MongoDB Atlas: Check database performance

## 💰 Cost Breakdown
- **Vercel**: Free tier (or $20/month Pro)
- **Railway**: $5/month
- **MongoDB Atlas**: Free tier (or $9/month M0)
- **Total**: $5-15/month

## 🔧 Troubleshooting

### Common Issues:
1. **CORS errors**: Check CORS configuration in backend
2. **Database connection**: Verify MongoDB URI and network access
3. **Environment variables**: Ensure all variables are set correctly
4. **Build errors**: Check Vercel build logs
5. **Runtime errors**: Check Railway logs

### Useful Commands:
```bash
# Test backend locally
cd backend
npm start

# Test frontend locally
npm run dev

# Check environment variables
echo $VITE_API_URL
```
