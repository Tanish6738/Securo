import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const response = await fetch(`${process.env.XPOSEDORNOT_API_BASE}check-email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to check email breach status')
    }    const data = await response.json()
    
    // XposedOrNot API returns: { breaches: [["breach1", "breach2", ...]], email: "...", status: "success" }
    // We need to flatten the nested array and determine if email is breached
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
  } catch (error) {
    console.error('Email breach check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email breach status' },
      { status: 500 }
    )
  }
}
