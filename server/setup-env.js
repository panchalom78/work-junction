import { writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate a secure JWT_SECRET
const jwtSecret = randomBytes(64).toString('hex');

const envContent = `# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (REQUIRED)
JWT_SECRET=${jwtSecret}
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
`;

const envPath = join(__dirname, '.env');

try {
    writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env file created successfully!');
    console.log('✅ JWT_SECRET has been generated automatically');
    console.log('\n📝 Next steps:');
    console.log('1. Review the .env file and update any optional settings (email, cloudinary)');
    console.log('2. Make sure MongoDB is running');
    console.log('3. Restart your server');
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('\n📝 Manual setup:');
    console.log('1. Create a file named ".env" in the server directory');
    console.log('2. Copy the content from ENV_SETUP.md');
    console.log(`3. Use this JWT_SECRET: ${jwtSecret}`);
}

