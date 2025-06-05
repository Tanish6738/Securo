import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Fetch messages using authentication token from Mail.tm API
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
    
    // Transform Mail.tm message format to our expected format
    const transformedMessages = (data['hydra:member'] || []).map(message => ({
      id: message.id,
      subject: message.subject,
      from: message.from.address,
      text: message.intro || message.text || 'No preview available',
      date: message.createdAt,
      read: message.seen || false,
      hasAttachments: message.hasAttachments || false
    }))
    
    return NextResponse.json({
      messages: transformedMessages,
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
