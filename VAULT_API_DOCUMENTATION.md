# Vault API Documentation

## Overview
The Vault API provides secure file storage with client-side encryption. All files are encrypted using AES encryption with the user's vault password before being stored in MongoDB.

## Authentication
All vault endpoints require authentication via Clerk. The user must be signed in to access any vault functionality.

## Environment Variables
Add the following to your `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/privayguard
```

## API Endpoints

### Vault Management

#### GET /api/vault
Retrieve all vault items for the authenticated user.

**Response:**
```json
{
  "items": [
    {
      "_id": "vault_item_id",
      "userId": "user_clerk_id",
      "fileName": "timestamp_originalname.ext",
      "originalName": "document.pdf",
      "mimeType": "application/pdf",
      "fileSize": 1024576,
      "description": "Important document",
      "tags": ["work", "important"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST /api/vault
Upload and encrypt a file to the vault.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (File, required): The file to upload
- `vaultPassword` (string, required): User's vault password for encryption
- `description` (string, optional): File description
- `tags` (string, optional): Comma-separated tags

**Response:**
```json
{
  "message": "File uploaded and encrypted successfully",
  "item": {
    "_id": "vault_item_id",
    "fileName": "timestamp_originalname.ext",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "fileSize": 1024576,
    "description": "Important document",
    "tags": ["work", "important"]
  }
}
```

#### DELETE /api/vault?id={itemId}
Delete a vault item.

**Query Parameters:**
- `id` (string, required): Vault item ID

**Response:**
```json
{
  "message": "Item deleted successfully",
  "deletedItem": {
    "id": "vault_item_id",
    "fileName": "timestamp_originalname.ext",
    "originalName": "document.pdf"
  }
}
```

### File Download

#### GET /api/vault/download?id={itemId}&password={vaultPassword}
Download and decrypt a vault item.

**Query Parameters:**
- `id` (string, required): Vault item ID
- `password` (string, required): User's vault password for decryption

**Response:** Binary file data with appropriate headers
- `Content-Type`: Original file MIME type
- `Content-Disposition`: `attachment; filename="original_filename"`
- `Content-Length`: File size

### User Management

#### GET /api/user
Get user profile and settings.

**Response:**
```json
{
  "user": {
    "_id": "mongodb_user_id",
    "clerkId": "user_clerk_id",
    "email": "user@example.com",
    "username": "username",
    "settings": {
      "notifications": {
        "breachAlerts": true,
        "weeklyReports": true,
        "securityTips": false,
        "productUpdates": false
      },
      "privacy": {
        "dataCollection": false,
        "analytics": false,
        "thirdPartySharing": false
      },
      "security": {
        "twoFactorEnabled": false,
        "sessionTimeout": 30,
        "passwordChangeReminder": true
      }
    },
    "hasVaultPassword": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "clerkUser": {
      "id": "user_clerk_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "imageUrl": "https://example.com/image.jpg"
    }
  }
}
```

#### POST /api/user
Update user settings or vault password.

**Body:**
```json
{
  "settings": {
    "notifications": {
      "breachAlerts": true
    }
  },
  "vaultPassword": "new_vault_password"
}
```

**Response:**
```json
{
  "message": "User settings updated successfully",
  "user": {
    // Updated user object
    "hasVaultPassword": true
  }
}
```

#### PUT /api/user
Verify vault password.

**Body:**
```json
{
  "password": "vault_password"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Password verified"
}
```

### Monitored Emails

#### GET /api/monitored-emails
Get monitored emails for breach monitoring.

**Response:**
```json
{
  "emails": [
    {
      "_id": "email_id",
      "userId": "user_clerk_id",
      "email": "user@example.com",
      "isPrimary": true,
      "breachCount": 2,
      "lastChecked": "2024-01-01T00:00:00.000Z",
      "breaches": [
        {
          "name": "Example Breach",
          "domain": "example.com",
          "breachDate": "2023-12-01T00:00:00.000Z",
          "pwnCount": 1000000,
          "dataClasses": ["Email addresses", "Passwords"],
          "description": "A data breach occurred...",
          "isVerified": true,
          "isFabricated": false,
          "isSpamList": false,
          "isRetired": false,
          "logoPath": "https://example.com/logo.png"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### POST /api/monitored-emails
Add email to monitoring.

**Body:**
```json
{
  "email": "email@example.com",
  "isPrimary": false
}
```

#### DELETE /api/monitored-emails?id={emailId}
Remove email from monitoring.

#### PUT /api/monitored-emails
Update monitored email breach information.

**Body:**
```json
{
  "emailId": "email_id",
  "breaches": [...],
  "breachCount": 2,
  "lastChecked": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

### Encryption
- Files are encrypted using AES-256-CBC encryption
- PBKDF2 key derivation with 10,000 iterations
- Random salt and IV for each file
- Client-side encryption before upload

### Password Security
- Vault passwords are hashed using bcrypt with 12 rounds
- Password verification without storing plaintext
- Separate vault password from user account password

### Access Control
- All API endpoints require valid Clerk authentication
- Users can only access their own data
- Vault items are filtered by user ID

## Database Schema

### User Model
```javascript
{
  clerkId: String (required, unique),
  email: String (required, unique),
  username: String,
  settings: Object,
  vaultPassword: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### VaultItem Model
```javascript
{
  userId: String (required, indexed),
  fileName: String (required),
  originalName: String (required),
  mimeType: String (required),
  fileSize: Number (required),
  encryptedData: Buffer (required),
  encryptionIv: String (required),
  tags: [String],
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### MonitoredEmail Model
```javascript
{
  userId: String (required, indexed),
  email: String (required),
  isPrimary: Boolean,
  breachCount: Number,
  lastChecked: Date,
  breaches: [Object],
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing parameters, invalid data)
- `401`: Unauthorized (invalid/missing authentication, wrong password)
- `404`: Not Found (item doesn't exist)
- `409`: Conflict (duplicate email monitoring)
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## Usage Examples

### Upload a file
```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('vaultPassword', 'user-vault-password')
formData.append('description', 'Important document')
formData.append('tags', 'work,confidential')

const response = await fetch('/api/vault', {
  method: 'POST',
  body: formData
})
```

### Download a file
```javascript
const response = await fetch(
  `/api/vault/download?id=${itemId}&password=${encodeURIComponent(vaultPassword)}`
)

if (response.ok) {
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = originalFileName
  a.click()
}
```

### Check vault password
```javascript
const response = await fetch('/api/user', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: vaultPassword })
})

const { valid } = await response.json()
```
