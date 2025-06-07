# Frontend Integration Guide

This guide shows how to update your frontend to use the new MailService backend instead of the Next.js API routes.

## Changes Required

### 1. Update API Base URL

Create a configuration file or update your existing API calls:

```javascript
// config/api.js
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-mailservice-domain.com' 
  : 'http://localhost:3001';

export { API_BASE };
```

### 2. Update temp-email page.js

Replace the fetch calls in your `src/app/temp-email/page.js`:

```javascript
// Before (Next.js API routes)
const response = await fetch('/api/temp-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customName })
});

// After (MailService)
const response = await fetch('http://localhost:3001/api/temp-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customName })
});
```

### 3. Update Message Fetching

```javascript
// Before
const response = await fetch(`/api/temp-email?token=${email.token}`);

// After
const response = await fetch(`http://localhost:3001/api/messages/${email.id}`);
```

### 4. Complete Integration Example

Here's how your updated `createTempEmail` and `fetchMessages` functions should look:

```javascript
const createTempEmail = async (customName = "") => {
  setIsCreating(true);
  try {
    const response = await fetch('http://localhost:3001/api/temp-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customName: customName.trim() })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to create email');
    }

    const newEmail = await response.json();
    
    // Update local state
    const updatedEmails = [...emails, newEmail];
    setEmails(updatedEmails);
    localStorage.setItem('tempEmails', JSON.stringify(updatedEmails));
    
    setCustomAddress("");
    
    // Auto-select the new email
    setActiveEmail(newEmail);
    await fetchMessages(newEmail);
    
  } catch (error) {
    console.error('Email creation error:', error);
    alert(`Failed to create email: ${error.message}`);
  } finally {
    setIsCreating(false);
  }
};

const fetchMessages = async (email) => {
  if (!email?.id) return;
  
  setIsLoadingMessages(true);
  try {
    const response = await fetch(`http://localhost:3001/api/messages/${email.id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to fetch messages');
    }

    const data = await response.json();
    setMessages(data.messages || []);
    
  } catch (error) {
    console.error('Message fetch error:', error);
    setMessages([]);
  } finally {
    setIsLoadingMessages(false);
  }
};
```

### 5. Error Handling Updates

The MailService provides consistent error responses:

```javascript
// Handle MailService errors
.catch(error => {
  if (error.message.includes('Rate limit')) {
    alert('Too many requests. Please wait before trying again.');
  } else if (error.message.includes('not found')) {
    alert('Email expired or not found.');
  } else {
    alert(`Error: ${error.message}`);
  }
});
```

### 6. Health Check Integration

Add a health check to verify MailService connectivity:

```javascript
const checkMailServiceHealth = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    const health = await response.json();
    console.log('MailService status:', health.status);
    return health.status === 'healthy';
  } catch (error) {
    console.error('MailService unavailable:', error);
    return false;
  }
};
```

## Development Setup

1. **Start MailService** (Terminal 1):
   ```bash
   cd MailService
   npm start
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd ..
   npm run dev
   ```

3. **Verify Integration**:
   - Frontend: http://localhost:3000
   - MailService: http://localhost:3001
   - Health Check: http://localhost:3001/health

## Production Deployment

1. Deploy MailService to your server/cloud platform
2. Update API_BASE configuration with production URL
3. Ensure CORS is configured for your frontend domain
4. Set appropriate environment variables

## Benefits of Migration

- ✅ **Separation of Concerns**: Email service is isolated
- ✅ **Better Performance**: Dedicated service for email operations
- ✅ **Scalability**: MailService can be scaled independently
- ✅ **Monitoring**: Dedicated health checks and debugging
- ✅ **Rate Limiting**: Better protection against abuse
- ✅ **Memory Management**: Efficient cleanup of expired emails

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure MailService CORS is configured for your frontend URL
2. **Connection Refused**: Check if MailService is running on port 3001
3. **Rate Limits**: Implement proper error handling for rate limit responses
4. **Email Expiration**: Handle cases where emails expire during use

### Debug Endpoints:

- Health: `GET /api/debug/health`
- Stats: `GET /api/debug/stats`
- Test: `POST /api/debug/test-email`
