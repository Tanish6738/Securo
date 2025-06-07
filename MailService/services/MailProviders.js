import fetch from 'node-fetch';

class MailProviders {
  constructor() {
    this.providers = [
      {
        name: 'mail.tm',
        baseUrl: process.env.MAILTM_API_BASE || 'https://api.mail.tm',
        active: true,
        priority: 1
      }
      // Additional providers can be added here
    ];
  }

  // Enhanced fetch with timeout and error handling
  async fetchWithTimeout(url, options, timeout = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'User-Agent': 'PrivacyGuard/1.0',
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  // Get available domains from mail.tm
  async getDomains() {
    const provider = this.providers.find(p => p.name === 'mail.tm');
    
    try {
      console.log('🔍 Fetching available domains...');
      const response = await this.fetchWithTimeout(`${provider.baseUrl}/domains`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Domain fetch failed:', response.status, response.statusText);
        
        if (response.status === 403) {
          throw new Error('Access forbidden - API may be blocking requests from this IP range');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded - too many requests to mail.tm API');
        } else if (response.status >= 500) {
          throw new Error('Mail.tm server error - service may be temporarily unavailable');
        }

        throw new Error(`Failed to fetch domains: ${response.status} ${response.statusText}`);
      }

      const domains = await response.json();
      console.log('✅ Domains fetched successfully:', domains['hydra:member']?.length || 0, 'domains available');

      return domains['hydra:member'] || [];
    } catch (error) {
      console.error('Domain fetch error:', error);
      throw error;
    }
  }

  // Generate unique email address
  generateUniqueEmail(domain, customName = '', attempt = 0) {
    let username;
    
    if (customName) {
      // If custom name provided, add timestamp and attempt number for uniqueness
      const timestamp = Date.now().toString().slice(-6);
      const suffix = attempt > 0 ? `_${attempt}` : '';
      username = `${customName}${timestamp}${suffix}`;
    } else {
      // Generate random username with timestamp for uniqueness
      const randomStr = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now().toString().slice(-4);
      username = `${randomStr}${timestamp}`;
    }
    
    return `${username}@${domain}`;
  }

  // Create email account
  async createAccount(email, password) {
    const provider = this.providers.find(p => p.name === 'mail.tm');
    
    try {
      const response = await fetch(`${provider.baseUrl}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: email,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error('EMAIL_EXISTS');
        }
        const errorData = await response.text();
        console.error('Account creation failed:', errorData);
        throw new Error(`Failed to create account: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Get authentication token
  async getAuthToken(email, password) {
    const provider = this.providers.find(p => p.name === 'mail.tm');
    
    try {
      const response = await fetch(`${provider.baseUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: email,
          password: password,
        }),
      });

      if (response.ok) {
        const authData = await response.json();
        return authData.token;
      } else {
        console.warn('Failed to get auth token');
        return null;
      }
    } catch (error) {
      console.warn('Auth token error:', error);
      return null;
    }
  }

  // Fetch messages for an email
  async fetchMessages(token) {
    const provider = this.providers.find(p => p.name === 'mail.tm');
    
    try {
      const response = await fetch(`${provider.baseUrl}/messages?page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            messages: [],
            totalItems: 0,
            error: 'Authentication failed - token may be expired'
          };
        }
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        messages: data['hydra:member'] || [],
        totalItems: data['hydra:totalItems'] || 0
      };
    } catch (error) {
      console.error('Messages fetch error:', error);
      throw error;
    }
  }

  // Health check for providers
  async checkHealth() {
    const results = [];
    
    for (const provider of this.providers) {
      try {
        const start = Date.now();
        const response = await this.fetchWithTimeout(`${provider.baseUrl}/domains`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }, 5000);
        
        const responseTime = Date.now() - start;
        
        results.push({
          name: provider.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime,
          statusCode: response.status
        });
      } catch (error) {
        results.push({
          name: provider.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }
}

// Create singleton instance
const mailProviders = new MailProviders();

export default mailProviders;
