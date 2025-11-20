# Environment Variables Setup

## Quick Fix for "Server configuration error"

You need to create a `.env` file in the `server` directory with the required environment variables.

## Steps to Fix:

1. **Create a `.env` file** in the `server` directory (same level as `package.json`)

2. **Add the following content** to the `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (REQUIRED)
JWT_SECRET=449cf7982c376cec1bbaf65a455af14ad015ba2f48edb013d615730506990c666ede618659acb6f098c45fc6b24cd9b0ba70f5d416c679259a2c875b192096a1
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/work-junction

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Email Configuration (Optional - for OTP emails)
# If not configured, registration will still work but emails won't be sent
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=WorkJunction

# Cloudinary Configuration (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. **Restart your server** after creating the `.env` file

## Important Notes:

- **JWT_SECRET**: A secure random string has been generated for you above. You can use it or generate a new one.
- **MONGODB_URI**: Make sure MongoDB is running on your system
- **Email settings**: Optional - registration will work without them, but OTP emails won't be sent
- **Cloudinary settings**: Optional - only needed if you're using file uploads

## Generate a New JWT_SECRET (Optional):

If you want to generate a new JWT_SECRET, run this command in the server directory:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Verify Setup:

After creating the `.env` file, restart your server and try registering again. The error should be resolved.

