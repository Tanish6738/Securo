/**
 * NotificationService - Polling-based real-time notification system
 * Uses HTTP polling for better compatibility with deployment platforms like Render
 */

class NotificationService {
  constructor() {
    this.isActive = false;
    this.pollingInterval = null;
    this.listeners = new Map();
    this.userId = null;
    this.pollFrequency = 5000; // 5 seconds
    this.lastCheck = null;
  }

  /**
   * Start notification polling
   * @param {string} userId - Current user's ID
   */
  connect(userId) {
    if (this.isActive && this.userId === userId) {
      return;
    }

    this.userId = userId;
    this.isActive = true;
    this.startPolling();
    console.log('Notification service started for user:', userId);
  }

  /**
   * Start polling for notifications
   */
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      await this.checkForNotifications();
    }, this.pollFrequency);

    // Initial check
    this.checkForNotifications();
  }

  /**
   * Check for new notifications
   */
  async checkForNotifications() {
    if (!this.userId || !this.isActive) return;

    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach(notification => {
            this.handleNotification(notification);
          });
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  /**
   * Handle incoming notification
   * @param {Object} notification - Notification object
   */
  handleNotification(notification) {
    const { event, data } = notification;
    
    switch (event) {
      case 'vault_invitation':
        this.emit('vaultInvitation', data);
        break;
      
      case 'pin_setup_required':
        this.emit('pinSetupRequired', data);
        break;
      
      case 'vault_unlock_request':
        this.emit('vaultUnlockRequest', data);
        break;
      
      case 'vault_unlocked':
        this.emit('vaultUnlocked', data);
        break;
      
      case 'vault_locked':
        this.emit('vaultLocked', data);
        break;
      
      case 'member_added':
        this.emit('memberAdded', data);
        break;
        case 'member_removed':
        this.emit('memberRemoved', data);
        break;
      
      case 'pin_progress_update':
        this.emit('pinProgressUpdate', data);
        break;
      
      case 'file_upload_request':
        this.emit('fileUploadRequest', data);
        break;
      
      case 'upload_approved':
        this.emit('uploadApproved', data);
        break;
      
      case 'upload_denied':
        this.emit('uploadDenied', data);
        break;
      
      default:
        console.warn('Unknown notification event:', event);
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Send vault invitation notification (simulated)
   * @param {string} targetUserId - User to invite
   * @param {Object} vaultData - Vault information
   */
  sendVaultInvitation(targetUserId, vaultData) {
    // In polling mode, notifications are sent via API calls
    console.log('Vault invitation sent to user:', targetUserId, vaultData);
  }

  /**
   * Send PIN setup reminder (simulated)
   * @param {string} targetUserId - User who needs to set PIN
   * @param {Object} vaultData - Vault information
   */
  sendPinSetupReminder(targetUserId, vaultData) {
    console.log('PIN setup reminder sent to user:', targetUserId, vaultData);
  }

  /**
   * Send vault unlock request to all members (simulated)
   * @param {Array} memberIds - All vault member IDs
   * @param {Object} vaultData - Vault information
   */
  sendVaultUnlockRequest(memberIds, vaultData) {
    console.log('Vault unlock request sent to members:', memberIds, vaultData);
  }

  /**
   * Notify all members that vault is unlocked (simulated)
   * @param {Array} memberIds - All vault member IDs
   * @param {Object} vaultData - Vault information
   */
  notifyVaultUnlocked(memberIds, vaultData) {
    console.log('Vault unlocked notification sent to members:', memberIds, vaultData);
  }

  /**
   * Notify all members that vault is locked (simulated)
   * @param {Array} memberIds - All vault member IDs
   * @param {Object} vaultData - Vault information
   */
  notifyVaultLocked(memberIds, vaultData) {
    console.log('Vault locked notification sent to members:', memberIds, vaultData);
  }

  /**
   * Disconnect notification service
   */
  disconnect() {
    this.isActive = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.listeners.clear();
    console.log('Notification service disconnected');
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.isActive;
  }

  /**
   * Set polling frequency
   * @param {number} frequency - Polling frequency in milliseconds
   */
  setPollFrequency(frequency) {
    this.pollFrequency = frequency;
    if (this.isActive) {
      this.startPolling(); // Restart with new frequency
    }
  }

  /**
   * Mark notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   */
  async markAsRead(notificationIds) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Fallback notification methods for browser notifications
const fallbackNotifications = {
  /**
   * Show browser notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} options - Additional options
   */
  showBrowserNotification(title, body, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'shared-vault',
        requireInteraction: false,
        ...options
      });
    }
  },

  /**
   * Request notification permission
   */
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  },

  /**
   * Show toast notification as fallback
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  showToast(message, type = 'info') {
    // This could be integrated with a toast library
    console.log(`Toast [${type}]:`, message);
  }
};

export { notificationService, fallbackNotifications };
export default NotificationService;
