// In-memory email storage and management
class EmailManager {
  constructor() {
    this.emails = new Map(); // Store active emails
    this.TTL_HOURS = parseInt(process.env.EMAIL_TTL_HOURS) || 24;
  }

  // Store email data in memory with TTL
  storeEmail(emailData) {
    const expiresAt = new Date(Date.now() + (this.TTL_HOURS * 60 * 60 * 1000));
    
    const storedData = {
      ...emailData,
      expiresAt,
      createdAt: emailData.createdAt || new Date().toISOString()
    };

    this.emails.set(emailData.id, storedData);
    
    console.log(`📧 Stored email ${emailData.address} (ID: ${emailData.id}), expires at ${expiresAt.toISOString()}`);
    
    return storedData;
  }

  // Get email data by ID
  getEmail(emailId) {
    const email = this.emails.get(emailId);
    
    if (!email) {
      return null;
    }

    // Check if expired
    if (new Date() > new Date(email.expiresAt)) {
      this.emails.delete(emailId);
      console.log(`🗑️ Removed expired email ${email.address} (ID: ${emailId})`);
      return null;
    }

    return email;
  }

  // Get all active emails
  getAllEmails() {
    const now = new Date();
    const activeEmails = [];

    for (const [id, email] of this.emails.entries()) {
      if (now > new Date(email.expiresAt)) {
        this.emails.delete(id);
        console.log(`🗑️ Removed expired email ${email.address} (ID: ${id})`);
      } else {
        activeEmails.push(email);
      }
    }

    return activeEmails;
  }

  // Remove email by ID
  removeEmail(emailId) {
    const email = this.emails.get(emailId);
    if (email) {
      this.emails.delete(emailId);
      console.log(`🗑️ Manually removed email ${email.address} (ID: ${emailId})`);
      return true;
    }
    return false;
  }

  // Cleanup expired emails
  cleanupExpired() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, email] of this.emails.entries()) {
      if (now > new Date(email.expiresAt)) {
        this.emails.delete(id);
        cleanedCount++;
        console.log(`🗑️ Cleaned up expired email ${email.address} (ID: ${id})`);
      }
    }

    console.log(`🧹 Cleanup completed: ${cleanedCount} expired emails removed, ${this.emails.size} active emails remaining`);
    return cleanedCount;
  }

  // Get storage statistics
  getStats() {
    const now = new Date();
    let activeCount = 0;
    let expiredCount = 0;

    for (const [id, email] of this.emails.entries()) {
      if (now > new Date(email.expiresAt)) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      total: this.emails.size,
      active: activeCount,
      expired: expiredCount,
      ttlHours: this.TTL_HOURS
    };
  }
}

// Create singleton instance
const emailManager = new EmailManager();

export default emailManager;
