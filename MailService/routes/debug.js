import express from 'express';
import emailManager from '../services/EmailManager.js';
import mailProviders from '../services/MailProviders.js';
import { cleanupExpiredEmails } from '../utils/cleanup.js';
import { debugLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/debug/health - Health check with provider status
router.get('/health', debugLimiter, async (req, res) => {
  try {
    console.log('🔍 Running health check...');

    // Check mail providers
    const providerHealth = await mailProviders.checkHealth();
    
    // Get storage stats
    const storageStats = emailManager.getStats();
    
    // Test basic functionality
    const testResults = await runBasicTests();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'MailService',
      version: '1.0.0',
      providers: providerHealth,
      storage: storageStats,
      tests: testResults,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        mailServicePort: process.env.MAIL_SERVICE_PORT || 3001,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        emailTtlHours: process.env.EMAIL_TTL_HOURS || 24
      }
    };

    res.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'MailService',
      error: error.message
    });
  }
});

// GET /api/debug/stats - Get detailed statistics
router.get('/stats', debugLimiter, async (req, res) => {
  try {
    const stats = emailManager.getStats();
    const allEmails = emailManager.getAllEmails();
    
    res.json({
      storage: stats,
      emails: allEmails.map(email => ({
        id: email.id,
        address: email.address,
        domain: email.domain,
        createdAt: email.createdAt,
        expiresAt: email.expiresAt,
        timeRemaining: Math.max(0, Math.floor((new Date(email.expiresAt) - new Date()) / 1000 / 60)) + ' minutes'
      }))
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to get stats',
      details: error.message
    });
  }
});

// POST /api/debug/cleanup - Manual cleanup trigger
router.post('/cleanup', debugLimiter, async (req, res) => {
  try {
    const result = cleanupExpiredEmails();
    res.json({
      message: 'Cleanup completed',
      ...result
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      details: error.message
    });
  }
});

// POST /api/debug/test-email - Test email creation
router.post('/test-email', debugLimiter, async (req, res) => {
  try {
    console.log('🧪 Testing email creation...');
    
    // Get domains
    const domains = await mailProviders.getDomains();
    
    if (!domains || domains.length === 0) {
      throw new Error('No domains available for testing');
    }

    const domain = domains[0].domain;
    const testEmail = mailProviders.generateUniqueEmail(domain, 'test');
    
    res.json({
      message: 'Email creation test successful',
      testEmail,
      domain,
      domainsAvailable: domains.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      error: 'Email creation test failed',
      details: error.message
    });
  }
});

// Helper function to run basic tests
async function runBasicTests() {
  const tests = {
    domainFetch: false,
    emailGeneration: false,
    memoryStorage: false
  };

  try {
    // Test domain fetching
    const domains = await mailProviders.getDomains();
    tests.domainFetch = domains && domains.length > 0;

    // Test email generation
    if (tests.domainFetch) {
      const testEmail = mailProviders.generateUniqueEmail(domains[0].domain, 'test');
      tests.emailGeneration = testEmail && testEmail.includes('@');
    }

    // Test memory storage
    const testData = {
      id: 'test-' + Date.now(),
      address: 'test@example.com',
      token: 'test-token'
    };
    emailManager.storeEmail(testData);
    const retrieved = emailManager.getEmail(testData.id);
    tests.memoryStorage = retrieved && retrieved.id === testData.id;
    emailManager.removeEmail(testData.id); // Cleanup test data

  } catch (error) {
    console.error('Test error:', error);
  }

  return tests;
}

export default router;
