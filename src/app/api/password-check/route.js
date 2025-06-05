import { NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'

export async function POST(request) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Create SHA3-512 hash
    const hash = CryptoJS.SHA3(password, { outputLength: 512 }).toString()
    const prefix = hash.substring(0, 10)

    const response = await fetch(`https://passwords.xposedornot.com/v1/pass/anon/${prefix}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to check password')
    }

    const data = await response.json()
    
    // Check if our full hash is in the response
    const isCompromised = data.some(item => item.SearchPassAnon === hash)
    
    return NextResponse.json({
      isCompromised,
      occurrences: isCompromised ? data.find(item => item.SearchPassAnon === hash)?.count || 0 : 0
    })
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json(
      { error: 'Failed to check password' },
      { status: 500 }
    )
  }
}
