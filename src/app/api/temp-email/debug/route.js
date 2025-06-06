import { NextResponse } from 'next/server'

export async function GET(request) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    apiBase: process.env.MAILTM_API_BASE || 'https://api.mail.tm',
    checks: []
  }

  try {
    // Test 1: Basic connectivity to api.mail.tm
    console.log('🔍 Testing basic connectivity to api.mail.tm...')
    debugInfo.checks.push({ test: 'Basic connectivity', status: 'testing' })
    
    const connectivityTest = await fetch('https://api.mail.tm/domains', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PrivacyGuard-Debug/1.0'
      },
      timeout: 10000 // 10 second timeout
    })

    debugInfo.checks[0].status = connectivityTest.ok ? 'success' : 'failed'
    debugInfo.checks[0].statusCode = connectivityTest.status
    debugInfo.checks[0].statusText = connectivityTest.statusText

    if (connectivityTest.ok) {
      const domainsData = await connectivityTest.json()
      debugInfo.checks[0].domainsCount = domainsData['hydra:member']?.length || 0
      debugInfo.checks[0].availableDomains = domainsData['hydra:member']?.map(d => d.domain) || []
    } else {
      debugInfo.checks[0].errorBody = await connectivityTest.text()
    }

    // Test 2: Account creation test
    console.log('🔍 Testing account creation...')
    debugInfo.checks.push({ test: 'Account creation', status: 'testing' })
    
    const testEmail = `debug_${Date.now()}@${debugInfo.checks[0].availableDomains?.[0] || 'example.com'}`
    const testPassword = Math.random().toString(36).substring(2, 15)

    const accountTest = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PrivacyGuard-Debug/1.0'
      },
      body: JSON.stringify({
        address: testEmail,
        password: testPassword
      }),
      timeout: 10000
    })

    debugInfo.checks[1].status = accountTest.ok ? 'success' : 'failed'
    debugInfo.checks[1].statusCode = accountTest.status
    debugInfo.checks[1].statusText = accountTest.statusText
    debugInfo.checks[1].testEmail = testEmail

    if (!accountTest.ok) {
      debugInfo.checks[1].errorBody = await accountTest.text()
    }

    // Test 3: Token generation test (only if account creation succeeded)
    if (accountTest.ok) {
      console.log('🔍 Testing token generation...')
      debugInfo.checks.push({ test: 'Token generation', status: 'testing' })
      
      const tokenTest = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PrivacyGuard-Debug/1.0'
        },
        body: JSON.stringify({
          address: testEmail,
          password: testPassword
        }),
        timeout: 10000
      })

      debugInfo.checks[2].status = tokenTest.ok ? 'success' : 'failed'
      debugInfo.checks[2].statusCode = tokenTest.status
      debugInfo.checks[2].statusText = tokenTest.statusText

      if (!tokenTest.ok) {
        debugInfo.checks[2].errorBody = await tokenTest.text()
      }
    }

    // Test 4: Network information
    debugInfo.checks.push({
      test: 'Network information',
      status: 'info',
      headers: Object.fromEntries(request.headers.entries()),
      ipInfo: {
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
        'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for')
      }
    })

    // Test 5: Environment check
    debugInfo.checks.push({
      test: 'Environment variables',
      status: 'info',
      MAILTM_API_BASE: process.env.MAILTM_API_BASE ? 'set' : 'not set',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      VERCEL_ENV: process.env.VERCEL_ENV
    })

  } catch (error) {
    console.error('🚨 Debug test failed:', error)
    debugInfo.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    }
  }

  return NextResponse.json(debugInfo, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
}

export async function POST(request) {
  // Test specific API call with enhanced logging
  try {
    const { testType = 'domains' } = await request.json()
    
    console.log(`🔍 Running specific test: ${testType}`)
    
    const API_BASE = process.env.MAILTM_API_BASE || 'https://api.mail.tm'
    let result = { testType, timestamp: new Date().toISOString() }
    
    switch (testType) {
      case 'domains':
        const domainsResponse = await fetch(`${API_BASE}/domains`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PrivacyGuard-Debug/1.0'
          }
        })
        
        result.success = domainsResponse.ok
        result.status = domainsResponse.status
        result.statusText = domainsResponse.statusText
        
        if (domainsResponse.ok) {
          result.data = await domainsResponse.json()
        } else {
          result.error = await domainsResponse.text()
        }
        break
        
      case 'create-account':
        const domain = 'guerrillamail.info' // Fallback domain
        const testEmail = `test_${Date.now()}@${domain}`
        const testPassword = Math.random().toString(36).substring(2, 15)
        
        const accountResponse = await fetch(`${API_BASE}/accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PrivacyGuard-Debug/1.0'
          },
          body: JSON.stringify({
            address: testEmail,
            password: testPassword
          })
        })
        
        result.success = accountResponse.ok
        result.status = accountResponse.status
        result.statusText = accountResponse.statusText
        result.testEmail = testEmail
        
        if (accountResponse.ok) {
          result.data = await accountResponse.json()
        } else {
          result.error = await accountResponse.text()
        }
        break
        
      default:
        result.error = 'Unknown test type'
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('🚨 Specific test failed:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
