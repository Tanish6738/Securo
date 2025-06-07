import express from 'express';
import emailManager from '../services/EmailManager.js';
import mailProviders from '../services/MailProviders.js';
import { messageFetchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/messages/:emailId - Get messages for a specific email
router.get('/:emailId', messageFetchLimiter, async (req, res) => {
  try {
    const { emailId } = req.params;

    // Get email data from memory
    const email = emailManager.getEmail(emailId);
    
    if (!email) {
      return res.status(404).json({ 
        error: 'Email not found or expired',
        messages: [],
        totalItems: 0
      });
    }

    // Fetch messages using the stored token
    const result = await mailProviders.fetchMessages(email.token);

    res.json(result);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      details: error.message,
      messages: [],
      totalItems: 0
    });
  }
});

// GET /api/messages - Get messages using token (legacy support)
router.get('/', messageFetchLimiter, async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token is required',
        messages: [],
        totalItems: 0
      });
    }

    // Fetch messages directly using token
    const result = await mailProviders.fetchMessages(token);

    res.json(result);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      details: error.message,
      messages: [],
      totalItems: 0
    });
  }
});

export default router;
