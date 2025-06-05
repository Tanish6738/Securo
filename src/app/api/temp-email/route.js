import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { customName } = await request.json()
    
    // First, get a domain for temporary email
    const domainResponse = await fetch(`${process.env.MAILTM_API_BASE}/domains`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!domainResponse.ok) {
      throw new Error('Failed to fetch domains')
    }

    const domains = await domainResponse.json()
    const domain = domains['hydra:member'][0]?.domain

    if (!domain) {
      throw new Error('No available domains')
    }

    // Generate email with custom name or random
    const username = customName || Math.random().toString(36).substring(2, 15)
    const email = `${username}@${domain}`
    const password = Math.random().toString(36).substring(2, 15)

    // Create account
    const accountResponse = await fetch(`${process.env.MAILTM_API_BASE}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: email,
        password: password
      })
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.text()
      console.error('Account creation failed:', errorData)
      throw new Error('Failed to create account')
    }
    
    const account = await accountResponse.json()
    
    // Get authentication token
    const authResponse = await fetch(`${process.env.MAILTM_API_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: email,
        password: password
      })
    })

    let token = null
    if (authResponse.ok) {
      const authData = await authResponse.json()
      token = authData.token
    }
    
    return NextResponse.json({
      address: account.address || email,
      token: token || account.id,
      id: account.id,
      createdAt: account.createdAt || new Date().toISOString(),
      domain: domain,
      password: password // Store for future authentication
    })
  } catch (error) {
    console.error('Temp email generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate temporary email' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Fetch messages using authentication token
    const response = await fetch(`${process.env.MAILTM_API_BASE}/messages?page=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // If token is invalid or expired, return empty result
      if (response.status === 401) {
        return NextResponse.json({
          messages: [],
          totalItems: 0,
          error: 'Authentication failed - token may be expired'
        })
      }
      throw new Error('Failed to fetch messages')
    }

    const data = await response.json()
    
    return NextResponse.json({
      messages: data['hydra:member'] || [],
      totalItems: data['hydra:totalItems'] || 0
    })
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
