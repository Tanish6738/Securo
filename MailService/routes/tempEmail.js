import express from 'express';
import emailManager from '../services/EmailManager.js';
import mailProviders from '../services/MailProviders.js';
import { generateRandomPassword, sanitizeCustomName } from '../utils/generator.js';
import { emailCreationLimiter } from '../middleware/rateLimiter.js';
import { validateEmailCreation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// POST /api/temp-email - Create new temporary email
router.post('/', emailCreationLimiter, validateEmailCreation, handleValidationErrors, async (req, res) => {
  try {
    const { customName } = req.body;
    const sanitizedName = sanitizeCustomName(customName);

    console.log('🚀 Starting temp email creation...');
    console.log('📍 Environment:', process.env.NODE_ENV);
    console.log('👤 Custom Name:', sanitizedName || 'none');

    // Get available domains
    const domains = await mailProviders.getDomains();
    
    if (!domains || domains.length === 0) {
      throw new Error('No available domains from mail.tm');
    }

    const domain = domains[0].domain;
    console.log('🏷️ Selected domain:', domain);

    // Try to create account with retries for unique email
    let account = null;
    let email = null;
    let password = generateRandomPassword();
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      email = mailProviders.generateUniqueEmail(domain, sanitizedName, attempt);

      console.log(`Attempt ${attempt + 1}: Trying to create account with email: ${email}`);

      try {
        account = await mailProviders.createAccount(email, password);
        console.log(`✅ Successfully created account: ${email}`);
        break;
      } catch (error) {
        if (error.message === 'EMAIL_EXISTS') {
          console.log(`Email ${email} already exists, trying again...`);
          continue;
        } else {
          throw error;
        }
      }
    }

    if (!account) {
      throw new Error('Failed to create unique email after multiple attempts');
    }

    // Get authentication token
    const token = await mailProviders.getAuthToken(email, password);

    // Create email data object
    const emailData = {
      address: account.address || email,
      token: token || account.id,
      id: account.id,
      createdAt: account.createdAt || new Date().toISOString(),
      domain: domain,
      password: password
    };

    // Store in memory
    const storedEmail = emailManager.storeEmail(emailData);

    res.json(storedEmail);
  } catch (error) {
    console.error('Temp email generation error:', error);
    res.status(500).json({
      error: 'Failed to generate temporary email',
      details: error.message,
    });
  }
});

// DELETE /api/temp-email/:emailId - Delete temporary email
router.delete('/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    
    const removed = emailManager.removeEmail(emailId);
    
    if (removed) {
      res.json({ message: 'Email deleted successfully' });
    } else {
      res.status(404).json({ error: 'Email not found' });
    }
  } catch (error) {
    console.error('Email deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete email',
      details: error.message,
    });
  }
});

// GET /api/temp-email - Get all stored emails
router.get('/', async (req, res) => {
  try {
    const emails = emailManager.getAllEmails();
    res.json({ emails, count: emails.length });
  } catch (error) {
    console.error('Email list error:', error);
    res.status(500).json({
      error: 'Failed to get email list',
      details: error.message,
    });
  }
});

// GET /api/temp-email/:emailId - Get specific email
router.get('/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    
    const email = emailManager.getEmail(emailId);
    
    if (email) {
      res.json(email);
    } else {
      res.status(404).json({ error: 'Email not found or expired' });
    }
  } catch (error) {
    console.error('Email fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch email',
      details: error.message,
    });
  }
});

export default router;
