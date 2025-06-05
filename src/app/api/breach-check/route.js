import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, type = 'basic' } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Choose endpoint based on type
    let endpoint = ''
    switch (type) {
      case 'analytics':
        endpoint = `breach-analytics?email=${encodeURIComponent(email)}`
        break
      case 'basic':
      default:
        endpoint = `check-email/${encodeURIComponent(email)}`
        break
    }

    const response = await fetch(`${process.env.XPOSEDORNOT_API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to check email breach status')
    }

    const data = await response.json()
      if (type === 'analytics') {
      // Handle analytics response format - pass through the full response structure
      return NextResponse.json({
        isBreached: data.ExposedBreaches?.breaches_details?.length > 0 || false,
        breaches: data.ExposedBreaches?.breaches_details || [],
        breachCount: data.ExposedBreaches?.breaches_details?.length || 0,
        email: email,
        status: 'success',
        // Pass through the main analytics sections that the frontend expects
        BreachMetrics: data.BreachMetrics,
        BreachesSummary: data.BreachesSummary,
        ExposedBreaches: data.ExposedBreaches,
        ExposedPastes: data.ExposedPastes,
        PasteMetrics: data.PasteMetrics,
        PastesSummary: data.PastesSummary
      })
    } else {
      // Handle basic check response format
      let flattenedBreaches = []
      let isBreached = false
      
      if (data.breaches && Array.isArray(data.breaches) && data.breaches.length > 0) {
        // The API returns an array containing one nested array of breach names
        // Flatten the nested array structure to get individual breach names
        flattenedBreaches = data.breaches.flat()
        isBreached = flattenedBreaches.length > 0
      }
      
      return NextResponse.json({
        isBreached: isBreached,
        breaches: flattenedBreaches,
        breachCount: flattenedBreaches.length,
        email: data.email || email,
        status: data.status || 'success',
        details: data
      })
    }
  } catch (error) {
    console.error('Email breach check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email breach status' },
      { status: 500 }
    )
  }
}
