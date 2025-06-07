import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    // Validate environment variable
    if (!process.env.XPOSEDORNOT_API_BASE) {
      console.error('XPOSEDORNOT_API_BASE environment variable is not set')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }
    
    // Choose endpoint based on domain parameter
    let endpoint = 'breaches'
    if (domain) {
      endpoint = `breaches?domain=${encodeURIComponent(domain)}`
    }

    const apiUrl = `${process.env.XPOSEDORNOT_API_BASE}${endpoint}`
    console.log('Fetching from:', apiUrl)  ;  const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.XPOSEDORNOT_API_KEY,
      },
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received data:', { hasData: !!data, keys: Object.keys(data) })
    
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
    console.error('Breaches fetch error:', error.message)
    console.error('Full error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch breaches',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
