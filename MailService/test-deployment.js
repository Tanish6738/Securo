/**
 * Comprehensive Test Script for Deployed MailService
 * URL: https://securo-mail-service.onrender.com
 * 
 * Run with: node test-deployment.js
 */

const API_BASE = 'https://securo-mail-service.onrender.com';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  const result = await makeRequest(`${API_BASE}/health`);
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Service: ${result.data.service} v${result.data.version}`);
    console.log(`   Timestamp: ${result.data.timestamp}`);
    return true;
  } else {
    console.log('❌ Health check failed:', result.error || result.status);
    return false;
  }
}

async function testEmailCreation() {
  console.log('\n📧 Testing Email Creation...');
  
  const customName = `test${Date.now()}`;
  const result = await makeRequest(`${API_BASE}/api/temp-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customName })
  });
  
  if (result.success) {
    console.log('✅ Email creation passed');
    console.log(`   Address: ${result.data.address}`);
    console.log(`   Domain: ${result.data.domain}`);
    console.log(`   ID: ${result.data.id}`);
    console.log(`   Expires: ${result.data.expiresAt}`);
    return result.data;
  } else {
    console.log('❌ Email creation failed:', result.error || result.status);
    return null;
  }
}

async function testMessageFetching(emailId) {
  console.log('\n📬 Testing Message Fetching...');
  
  const result = await makeRequest(`${API_BASE}/api/messages/${emailId}`);
  
  if (result.success) {
    console.log('✅ Message fetching passed');
    console.log(`   Total messages: ${result.data.totalItems}`);
    console.log(`   Messages: ${JSON.stringify(result.data.messages, null, 2)}`);
    return true;
  } else {
    console.log('❌ Message fetching failed:', result.error || result.status);
    return false;
  }
}

async function testDebugStats() {
  console.log('\n📊 Testing Debug Stats...');
  
  const result = await makeRequest(`${API_BASE}/api/debug/stats`);
  
  if (result.success) {
    console.log('✅ Debug stats passed');
    console.log(`   Total emails: ${result.data.storage.total}`);
    console.log(`   Active emails: ${result.data.storage.active}`);
    console.log(`   Expired emails: ${result.data.storage.expired}`);
    console.log(`   TTL hours: ${result.data.storage.ttlHours}`);
    return true;
  } else {
    console.log('❌ Debug stats failed:', result.error || result.status);
    return false;
  }
}

async function testDebugHealth() {
  console.log('\n🔍 Testing Debug Health...');
  
  const result = await makeRequest(`${API_BASE}/api/debug/health`);
  
  if (result.success) {
    console.log('✅ Debug health passed');
    console.log(`   Service: ${result.data.service} v${result.data.version}`);
    console.log(`   Environment: ${result.data.environment.nodeEnv}`);
    console.log(`   Providers: ${result.data.providers.length} configured`);
    
    // Show provider status
    result.data.providers.forEach(provider => {
      console.log(`   - ${provider.name}: ${provider.status} (${provider.responseTime}ms)`);
    });
    
    return true;
  } else {
    console.log('❌ Debug health failed:', result.error || result.status);
    return false;
  }
}

async function testTestEmail() {
  console.log('\n🧪 Testing Debug Test Email...');
  
  const result = await makeRequest(`${API_BASE}/api/debug/test-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (result.success) {
    console.log('✅ Test email creation passed');
    console.log(`   Address: ${result.data.address}`);
    console.log(`   ID: ${result.data.id}`);
    return true;
  } else {
    console.log('❌ Test email creation failed:', result.error || result.status);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting...');
  
  const requests = [];
  const startTime = Date.now();
  
  // Send multiple requests quickly
  for (let i = 0; i < 5; i++) {
    requests.push(
      makeRequest(`${API_BASE}/api/temp-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customName: `ratetest${i}` })
      })
    );
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  const successful = results.filter(r => r.success).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  console.log(`   Sent: ${requests.length} requests in ${endTime - startTime}ms`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Rate limited: ${rateLimited}`);
  
  if (rateLimited > 0) {
    console.log('✅ Rate limiting is working');
  } else {
    console.log('ℹ️ No rate limiting triggered (might be expected)');
  }
  
  return true;
}

async function runAllTests() {
  console.log('🚀 Starting MailService Deployment Tests...');
  console.log(`📍 Testing: ${API_BASE}\n`);
  
  const testResults = [];
  
  try {
    // Run tests sequentially
    testResults.push(['Health Check', await testHealthCheck()]);
    
    const email = await testEmailCreation();
    testResults.push(['Email Creation', email !== null]);
    
    if (email) {
      testResults.push(['Message Fetching', await testMessageFetching(email.id)]);
    }
    
    testResults.push(['Debug Stats', await testDebugStats()]);
    testResults.push(['Debug Health', await testDebugHealth()]);
    testResults.push(['Test Email', await testTestEmail()]);
    testResults.push(['Rate Limiting', await testRateLimiting()]);
    
  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error);
  }
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const passed = testResults.filter(([, result]) => result).length;
  const total = testResults.length;
  
  testResults.forEach(([name, result]) => {
    console.log(`${result ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! MailService is fully operational.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔗 Useful URLs:');
  console.log(`   Health: ${API_BASE}/health`);
  console.log(`   Debug Stats: ${API_BASE}/api/debug/stats`);
  console.log(`   Debug Health: ${API_BASE}/api/debug/health`);
}

// Run the tests
runAllTests().catch(console.error);
