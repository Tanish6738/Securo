import { NextResponse } from 'next/server'
import { API_BASE } from "../../../../config/api.js";

// Fallback temporary email service with multiple providers
export async function POST(request) {
  try {
    const body = await request.json()
    
    console.log('🔄 Attempting primary MailService...')
    
    // First try our primary MailService
    try {
      const response = await fetch(`${API_BASE}/api/temp-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Primary MailService successful');
        return NextResponse.json(data);
      }
      
      console.log('⚠️ Primary MailService failed, trying fallback...');
    } catch (error) {
      console.log('⚠️ Primary MailService error, trying fallback:', error.message);
    }

    // Fallback to direct mail.tm implementation
    const { customName } = body;
    
    console.log('🔄 Using fallback temp email service...')
    
    // List of alternative temp email services
    const services = [
      {
        name: 'mail.tm',
        baseUrl: 'https://api.mail.tm',
        getDomains: async () => {
          const response = await fetch('https://api.mail.tm/domains')
          if (!response.ok) throw new Error('Failed to fetch domains')
          const data = await response.json()
          return data['hydra:member']?.map(d => d.domain) || []
        },
        createAccount: async (email, password) => {
          const response = await fetch('https://api.mail.tm/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
          })
          if (!response.ok) throw new Error('Failed to create account')
          return response.json()
        },
        getToken: async (email, password) => {
          const response = await fetch('https://api.mail.tm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
          })
          if (!response.ok) throw new Error('Failed to get token')
          const data = await response.json()
          return data.token
        }
      }
      // Add more services here as fallbacks
    ]
    
    let lastError = null
    
    // Try each service until one works
    for (const service of services) {
      try {
        console.log(`🔄 Trying service: ${service.name}`)
        
        // Get available domains
        const domains = await service.getDomains()
        if (!domains.length) {
          throw new Error('No domains available')
        }
        
        const domain = domains[0]
        console.log(`📧 Using domain: ${domain}`)
        
        // Generate unique email
        const timestamp = Date.now().toString().slice(-6)
        const randomStr = Math.random().toString(36).substring(2, 8)
        const username = customName ? 
          `${customName}${timestamp}` : 
          `temp${randomStr}${timestamp}`
        const email = `${username}@${domain}`
        const password = Math.random().toString(36).substring(2, 15)
        
        console.log(`📧 Creating account: ${email}`)
        
        // Create account
        const account = await service.createAccount(email, password)
        console.log(`✅ Account created successfully`)
        
        // Get token
        let token = null
        try {
          token = await service.getToken(email, password)
          console.log(`🔑 Token obtained successfully`)
        } catch (tokenError) {
          console.warn(`⚠️ Failed to get token, using account ID as fallback`)
          token = account.id
        }
        
        return NextResponse.json({
          address: account.address || email,
          token: token,
          id: account.id,
          createdAt: account.createdAt || new Date().toISOString(),
          domain: domain,
          password: password,
          service: service.name
        })
        
      } catch (error) {
        console.error(`❌ Service ${service.name} failed:`, error.message)
        lastError = error
        continue
      }
    }
    
    // If all services failed
    throw new Error(`All temp email services failed. Last error: ${lastError?.message}`)
    
  } catch (error) {
    console.error('🚨 Fallback temp email service error:', error)
    
    // Return a simulated response for development/testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Returning simulated response for development')
      return NextResponse.json({
        address: `demo_${Date.now()}@example.com`,
        token: `demo_token_${Date.now()}`,
        id: `demo_id_${Date.now()}`,
        createdAt: new Date().toISOString(),
        domain: 'example.com',
        password: 'demo_password',
        service: 'fallback_demo',
        note: 'This is a demo response - actual email functionality disabled'
      })
    }
    
    return NextResponse.json(
      { 
        error: 'All temporary email services are currently unavailable',
        details: error.message,
        timestamp: new Date().toISOString(),
        suggestion: 'Please try again later or contact support'
      },
      { status: 503 }
    )
  }
}

export async function GET(request) {
  // Fallback message fetching
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }
    
    // If this is a demo token, return empty messages
    if (token.startsWith('demo_token_')) {
      return NextResponse.json({
        messages: [],
        totalItems: 0,
        note: 'Demo mode - no actual messages available'
      })
    }
    
    // Try to fetch messages from mail.tm
    try {
      const response = await fetch(`https://api.mail.tm/messages?page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          messages: data['hydra:member'] || [],
          totalItems: data['hydra:totalItems'] || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch messages from mail.tm:', error)
    }
    
    // Return empty response if all fails
    return NextResponse.json({
      messages: [],
      totalItems: 0,
      error: 'Messages temporarily unavailable'
    })
    
  } catch (error) {
    console.error('Fallback message fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch messages',
        details: error.message
      },
      { status: 500 }
    )
  }
}
