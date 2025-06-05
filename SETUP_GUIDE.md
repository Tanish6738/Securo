# PrivacyGuard Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud instance)
3. **Clerk Account** (for authentication)

## Installation

1. **Clone and install dependencies:**
   ```bash
   cd privayguard
   npm install
   ```

2. **Install MongoDB locally (Windows):**
   
   **Option A: MongoDB Community Server**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Install and start as a Windows service
   - Default connection: `mongodb://localhost:27017`

   **Option B: MongoDB using Docker**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

   **Option C: MongoDB Atlas (Cloud)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string

3. **Set up environment variables:**
   
   Update `.env.local` with your MongoDB connection:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/privayguard
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/privayguard
   
   # Clerk Authentication (already configured)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dmFsaWQtc3BhbmllbC05Ny5jbGVyay5hY2NvdW50cy5kZXYk
   CLERK_SECRET_KEY=sk_test_3ttmMzaS4AzDN2cO2zwFMdUpmGpNCy4LsgHuyAUoI5
   
   # External APIs (already configured)
   XPOSEDORNOT_API_BASE=https://api.xposedornot.com/v1/
   NEXT_PUBLIC_NEWSAPI_KEY=89fc2a87d477499b9fdfae5ce1a6c56e
   MAILTM_API_BASE=https://api.mail.tm
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Running the Application

1. **Start MongoDB** (if running locally):
   ```bash
   # If installed as Windows service, it should start automatically
   # OR if using Docker:
   docker start mongodb
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up or sign in using Clerk authentication

## Features Overview

### 🔒 Secure Vault
- **End-to-end encryption** for file storage
- **Client-side encryption** using AES-256-CBC
- **Password-protected** with bcrypt hashing
- **Support for any file type** (documents, images, videos, etc.)
- **Organized with tags and descriptions**

**How it works:**
1. User sets a vault password (separate from account password)
2. Files are encrypted on the client-side before upload
3. Encrypted data is stored in MongoDB as binary blobs
4. Files are decrypted on download with the vault password

### 🔐 User Management
- **Clerk-based authentication** for secure login
- **User settings and preferences** stored in MongoDB
- **Breach monitoring setup** for email addresses
- **Profile management** with privacy controls

### 📧 Email Breach Monitoring
- **Monitor multiple email addresses** for data breaches
- **Store breach information** with detailed metadata
- **Track breach counts** and last check timestamps
- **Primary email designation** for main monitoring

## Database Collections

The application creates the following MongoDB collections:

1. **users**: User profiles and settings
2. **vaultitems**: Encrypted file storage
3. **monitoredemails**: Email addresses for breach monitoring

## Security Features

### File Encryption
- **AES-256-CBC encryption** with PBKDF2 key derivation
- **10,000 iterations** for key strengthening
- **Random salt and IV** for each file
- **No plaintext storage** of vault passwords

### Access Control
- **User isolation**: Users can only access their own data
- **Authentication required**: All endpoints require valid Clerk session
- **Password verification**: Vault access requires password confirmation

### Best Practices
- Vault passwords are **never stored in plaintext**
- File data is **never transmitted unencrypted**
- Database queries are **user-scoped** to prevent data leaks
- **Input validation** on all endpoints

## API Endpoints

### Vault Operations
- `GET /api/vault` - List user's encrypted files
- `POST /api/vault` - Upload and encrypt new file
- `DELETE /api/vault?id={id}` - Delete encrypted file
- `GET /api/vault/download?id={id}&password={pwd}` - Download and decrypt file

### User Management
- `GET /api/user` - Get user profile and settings
- `POST /api/user` - Update user settings or vault password
- `PUT /api/user` - Verify vault password

### Email Monitoring
- `GET /api/monitored-emails` - Get monitored email addresses
- `POST /api/monitored-emails` - Add email to monitoring
- `DELETE /api/monitored-emails?id={id}` - Remove email from monitoring
- `PUT /api/monitored-emails` - Update breach information

## File Upload Process

1. **User selects file** in the vault interface
2. **Vault password required** for first upload (sets vault password)
3. **File is read** as ArrayBuffer on client-side
4. **Encryption performed** using crypto-js with user's vault password
5. **Encrypted data uploaded** to server via FormData
6. **Stored in MongoDB** as encrypted binary blob
7. **File metadata saved** (name, size, type, description, tags)

## File Download Process

1. **User clicks download** on vault item
2. **Vault password required** for authentication
3. **Password verified** against stored hash
4. **Encrypted data retrieved** from MongoDB
5. **Decryption performed** server-side with user's password
6. **File downloaded** with original filename and content-type

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running (Windows)
net start | findstr MongoDB

# Check MongoDB logs
# Windows: %ProgramFiles%\\MongoDB\\Server\\7.0\\log\\mongod.log

# Test connection
mongo mongodb://localhost:27017/privayguard
```

### Environment Variables
- Ensure all required variables are set in `.env.local`
- Restart the development server after changing environment variables
- Check that `.env.local` is in the project root directory

### File Upload Issues
- Check file size limits (adjust if needed)
- Verify multipart/form-data content type
- Ensure vault password is provided
- Check browser console for encryption errors

### Authentication Issues
- Verify Clerk keys are correct
- Check that middleware is properly configured
- Ensure user is signed in before accessing vault features

## Development Notes

### Adding New File Types
The vault supports any file type automatically. File type detection is handled through:
- MIME type detection from the file
- File icons based on MIME type patterns
- No server-side file type restrictions

### Extending Encryption
The encryption utilities in `/src/lib/encryption.js` can be extended for:
- Different encryption algorithms
- Key derivation customization
- Additional security layers

### Database Optimization
Consider adding indexes for:
- Vault item queries by userId
- Email monitoring by userId
- File search by tags or description

### Monitoring and Logging
Add logging for:
- File upload/download events
- Failed authentication attempts
- Encryption/decryption errors
- Database connection issues

## Security Considerations

1. **Vault Password Security**
   - Encourage strong passwords
   - Consider password strength validation
   - Implement password recovery mechanism if needed

2. **File Size Limits**
   - Set appropriate limits based on storage capacity
   - Consider implementing file compression

3. **Rate Limiting**
   - Implement rate limiting for upload/download operations
   - Prevent abuse of encryption/decryption endpoints

4. **Audit Logging**
   - Log all vault access attempts
   - Track file upload/download events
   - Monitor for suspicious activity

## Deployment

For production deployment:

1. **Use production MongoDB instance**
2. **Set secure environment variables**
3. **Enable HTTPS/SSL**
4. **Configure proper CORS headers**
5. **Set up monitoring and backup**
6. **Implement rate limiting**
7. **Use production Clerk environment**

## Support

For technical support or questions:
- Check the API documentation in `VAULT_API_DOCUMENTATION.md`
- Review the codebase for implementation details
- Test endpoints using the provided examples
