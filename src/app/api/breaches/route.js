import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    // Choose endpoint based on domain parameter
    let endpoint = 'breaches'
    if (domain) {
      endpoint = `breaches?domain=${encodeURIComponent(domain)}`
    }

    const response = await fetch(`${process.env.XPOSEDORNOT_API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch breaches')
    }

    const data = await response.json()
      if (domain) {
      // Domain-specific breach response - pass through the exposedBreaches array
      return NextResponse.json({
        domain: domain,
        exposedBreaches: data.exposedBreaches || [],
        count: data.exposedBreaches?.length || 0,
        status: data.status || 'success'
      })
    } else {
      // All breaches response - pass through the exposedBreaches array
      return NextResponse.json({
        exposedBreaches: data.exposedBreaches || [],
        count: data.exposedBreaches?.length || 0,
        status: data.status || 'success'
      })
    }
  } catch (error) {
    console.error('Breaches fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breaches' },
      { status: 500 }
    )
  }
}
