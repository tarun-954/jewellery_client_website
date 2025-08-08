# Quick Setup Guide - Fix MongoDB Connection

## The Problem
Your Netlify site is not connecting to MongoDB because the `MONGO_URI` environment variable is not set.

## Solution Steps

### 1. Create Environment File
Copy the `env.example` file to `.env` in the root directory:

```bash
cp env.example .env
```

### 2. Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster if you don't have one
3. Get your connection string from the "Connect" button
4. Replace the placeholder in your `.env` file

### 3. Update Your .env File
Edit the `.env` file and replace the placeholders:

```env
MONGO_URI=mongodb+srv://your_actual_username:your_actual_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_string_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-site.netlify.app/.netlify/functions/api/auth/google/callback
FRONTEND_URL=https://your-site.netlify.app
```

### 4. Test Locally
Run the test script to verify your connection:

```bash
npm run test:db
```

### 5. Set Up Netlify Environment Variables
1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add all the variables from your `.env` file
4. Deploy your site

### 6. Test Netlify Function
Visit: `https://your-site.netlify.app/.netlify/functions/api/test`

## Common Issues

### "Authentication failed"
- Check your MongoDB Atlas username and password
- Make sure you're using the correct database user

### "Network timeout"
- Go to MongoDB Atlas > Network Access
- Click "Add IP Address" > "Allow Access from Anywhere" (0.0.0.0/0)

### "MONGO_URI is not set"
- Make sure you created the `.env` file
- Check that the variable name is exactly `MONGO_URI`

## Need Help?
1. Run `npm run test:db` to test your connection
2. Check the detailed guide in `NETLIFY_MONGODB_SETUP.md`
3. Look at Netlify function logs for specific error messages
