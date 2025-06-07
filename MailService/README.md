# MailService - Temporary Email Backend

A standalone Express.js service that provides temporary email functionality for PrivacyGuard. This service handles email creation, message fetching, and cleanup without requiring a database.

## Features

- 🚀 **Temporary Email Creation** - Generate disposable email addresses
- 📧 **Message Fetching** - Retrieve emails in real-time
- 🧹 **Auto Cleanup** - Automatic removal of expired emails
- 🔒 **Rate Limiting** - Protection against abuse
- 🏥 **Health Monitoring** - Debug and health check endpoints
- 💾 **In-Memory Storage** - No database required
- 🌐 **CORS Enabled** - Frontend integration ready

## Architecture

```
MailService/
├── server.js              # Main Express server
├── routes/
│   ├── tempEmail.js        # Email CRUD operations
│   ├── messages.js         # Message fetching
│   └── debug.js           # Health & debug endpoints
├── services/
│   ├── EmailManager.js     # In-memory email storage
│   └── MailProviders.js    # External API integration
├── middleware/
│   ├── rateLimiter.js      # Rate limiting configs
│   └── validation.js       # Request validation
├── utils/
│   ├── cleanup.js          # Memory cleanup utilities
│   └── generator.js        # Email generation utilities
└── config/
    └── providers.json      # Provider configurations
```

## API Endpoints

### Email Management
- `POST /api/temp-email` - Create new temporary email
- `GET /api/temp-email` - List all active emails
- `GET /api/temp-email/:id` - Get specific email details
- `DELETE /api/temp-email/:id` - Delete email

### Messages
- `GET /api/messages/:emailId` - Get messages for email ID
- `GET /api/messages?token=xxx` - Get messages by token (legacy)

### Debug & Health
- `GET /api/debug/health` - Comprehensive health check
- `GET /api/debug/stats` - Storage and usage statistics
- `POST /api/debug/cleanup` - Manual cleanup trigger
- `POST /api/debug/test-email` - Test email creation
- `GET /health` - Simple health check

## Environment Variables

```env
# Server Configuration
MAIL_SERVICE_PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Mail Provider
MAILTM_API_BASE=https://api.mail.tm

# Email Settings
EMAIL_TTL_HOURS=24
CLEANUP_INTERVAL_MINUTES=30

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_CREATION_LIMIT=10
MESSAGE_FETCH_LIMIT=50
```

## Usage

### Start the Service
```bash
# Development
npm run dev

# Production
npm start
```

### API Examples

#### Create Email
```bash
curl -X POST http://localhost:3001/api/temp-email \\
  -H "Content-Type: application/json" \\
  -d '{"customName": "mytest"}'
```

#### Get Messages
```bash
curl http://localhost:3001/api/messages/EMAIL_ID
```

#### Health Check
```bash
curl http://localhost:3001/api/debug/health
```

## Integration with Frontend

Update your frontend to use the MailService instead of Next.js API routes:

```javascript
// Before (Next.js API routes)
const response = await fetch('/api/temp-email', { ... });

// After (MailService)
const response = await fetch('http://localhost:3001/api/temp-email', { ... });
```

## Memory Management

- **TTL-based Expiration**: Emails automatically expire after 24 hours
- **Background Cleanup**: Runs every 30 minutes
- **No Persistence**: All data is stored in memory
- **Graceful Shutdown**: Cleans up on server restart

## Rate Limiting

- **Email Creation**: 10 per 15 minutes per IP
- **Message Fetching**: 50 per 5 minutes per IP
- **Debug Endpoints**: 20 per 10 minutes per IP

## Error Handling

- Provider fallback system
- Graceful degradation
- Detailed error logging
- Client-friendly error messages

## Security Features

- Helmet.js security headers
- CORS protection
- Rate limiting
- Input validation
- Request timeout handling

## Monitoring

Access detailed service health at `/api/debug/health`:
- Provider connectivity status
- Memory usage statistics
- Active email counts
- System test results

## Development

The service is designed to be:
- **Stateless**: No database dependencies
- **Scalable**: Can run multiple instances
- **Isolated**: Independent from main application
- **Observable**: Comprehensive logging and monitoring
