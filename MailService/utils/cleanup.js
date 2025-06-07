import emailManager from '../services/EmailManager.js';

// Cleanup expired emails from memory
export function cleanupExpiredEmails() {
  try {
    console.log('🧹 Starting cleanup process...');
    const cleanedCount = emailManager.cleanupExpired();
    
    const stats = emailManager.getStats();
    console.log(`📊 Storage stats: ${stats.active} active, ${stats.expired} expired, TTL: ${stats.ttlHours}h`);
    
    return {
      cleaned: cleanedCount,
      stats
    };
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return { error: error.message };
  }
}
