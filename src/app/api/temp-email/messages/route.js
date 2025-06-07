import { NextResponse } from 'next/server'
import { API_BASE } from "../../../../config/api.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailId = searchParams.get('emailId')
    
    if (!emailId) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 })
    }

    // Fetch messages from our MailService
    const response = await fetch(`${API_BASE}/api/messages/${emailId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          messages: [],
          totalItems: 0,
          error: 'Email not found or no messages available'
        })
      }
      console.error('Messages fetch failed:', response.status, response.statusText)
      throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch messages',
        details: error.message
      },
      { status: 500 }
    )
  }
}
