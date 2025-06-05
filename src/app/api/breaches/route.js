import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.XPOSEDORNOT_API_BASE}breaches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch breaches')
    }

    const data = await response.json()
    
    return NextResponse.json({
      breaches: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Breaches fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breaches' },
      { status: 500 }
    )
  }
}
