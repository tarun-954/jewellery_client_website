# Netlify MongoDB Connection Setup Guide

## Issues and Solutions

### 1. Environment Variables Not Set

**Problem**: The most common issue is that `MONGO_URI` environment variable is not set in Netlify.

**Solution**: 
1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following environment variables:

```
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-site.netlify.app/.netlify/functions/api/auth/google/callback
FRONTEND_URL=https://your-site.netlify.app
```

### 2. MongoDB Atlas Network Access

**Problem**: MongoDB Atlas might not allow connections from Netlify's IP addresses.

**Solution**:
1. Go to MongoDB Atlas dashboard
2. Navigate to Network Access
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Or add specific Netlify IP ranges if you want to be more restrictive

### 3. MongoDB Atlas Database User

**Problem**: Database user might not have proper permissions.

**Solution**:
1. Go to MongoDB Atlas dashboard
2. Navigate to Database Access
3. Create a new database user or edit existing one
4. Set authentication method to "Password"
5. Set database user privileges to "Read and write to any database"
6. Use a strong password

### 4. Connection String Format

**Problem**: Incorrect MongoDB connection string format.

**Solution**: Use this format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

### 5. Netlify Function Timeout

**Problem**: Netlify Functions have a 10-second timeout by default.

**Solution**: 
- The code has been updated with connection timeouts
- Consider using MongoDB connection pooling
- Implement connection caching

## Testing the Connection

### 1. Test Endpoint
Visit: `https://your-site.netlify.app/.netlify/functions/api/test`

Expected response:
```json
{
  "message": "Netlify Function is running!"
}
```

### 2. Check Function Logs
1. Go to Netlify dashboard
2. Navigate to Functions tab
3. Check the logs for any error messages

### 3. Test Database Connection
Visit: `https://your-site.netlify.app/.netlify/functions/api/products`

If successful, you should see a JSON array of products or an empty array.

## Common Error Messages and Solutions

### "MONGO_URI is not set"
- Add MONGO_URI environment variable in Netlify

### "MongoDB connection error: Authentication failed"
- Check username/password in connection string
- Verify database user permissions

### "MongoDB connection error: Network timeout"
- Check network access settings in MongoDB Atlas
- Verify connection string format

### "Function execution timeout"
- The function is taking too long to connect
- Check MongoDB Atlas performance
- Consider upgrading MongoDB Atlas plan

## Environment Variables Checklist

Make sure these are set in Netlify:

- [ ] `MONGO_URI` - Your MongoDB connection string
- [ ] `JWT_SECRET` - Secret key for JWT tokens
- [ ] `EMAIL_USER` - Gmail address for sending emails
- [ ] `EMAIL_PASSWORD` - Gmail app password
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `GOOGLE_CALLBACK_URL` - OAuth callback URL
- [ ] `FRONTEND_URL` - Your frontend URL

## Deployment Steps

1. **Set Environment Variables** in Netlify dashboard
2. **Deploy your code** to Netlify
3. **Test the connection** using the test endpoints
4. **Check function logs** for any errors
5. **Verify database operations** by testing CRUD endpoints

## Troubleshooting Commands

If you have access to Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables locally
netlify env:set MONGO_URI "your_connection_string"

# Deploy functions
netlify deploy --prod

# Check function logs
netlify functions:list
netlify functions:invoke api
```

## Performance Optimization

1. **Connection Pooling**: The updated code includes connection pooling settings
2. **Timeout Configuration**: Added appropriate timeouts for Netlify Functions
3. **Error Handling**: Improved error handling and logging
4. **Connection Caching**: Implemented connection state tracking

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Database Access**: Use least privilege principle for database users
3. **Network Security**: Consider IP whitelisting for production
4. **Connection String**: Use environment variables, not hardcoded strings

## Support

If you're still having issues:

1. Check Netlify function logs
2. Verify MongoDB Atlas status
3. Test connection string locally
4. Review environment variable settings
5. Check network access and database user permissions
