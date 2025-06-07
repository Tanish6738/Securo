// Test script to verify MailService integration
const API_BASE = 'https://securo-mail-service.onrender.com';

async function testMailServiceIntegration() {
  console.log('🧪 Testing MailService Integration...');
  console.log(`📡 Using API Base: ${API_BASE}`);
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Create temp email
    console.log('\n2️⃣ Testing temp email creation...');
    const createResponse = await fetch(`${API_BASE}/api/temp-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customName: 'testintegration' })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Create email failed: ${createResponse.status}`);
    }
    
    const emailData = await createResponse.json();
    console.log('✅ Email created:', {
      address: emailData.address,
      id: emailData.id,
      domain: emailData.domain,
      expiresAt: emailData.expiresAt
    });

    // Test 3: Check messages
    console.log('\n3️⃣ Testing messages endpoint...');
    const messagesResponse = await fetch(`${API_BASE}/api/messages/${emailData.id}`);
    const messagesData = await messagesResponse.json();
    console.log('✅ Messages retrieved:', messagesData);

    console.log('\n🎉 All tests passed! MailService integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   • Your temp-email page should now work with the deployed service');
    console.log('   • API calls will automatically use your Render deployment');
    console.log('   • Fallback service is available if primary service fails');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('   • Check if the Render service is running');
    console.log('   • Verify the API_BASE URL is correct');
    console.log('   • Check network connectivity');
  }
}

// Run the test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testMailServiceIntegration();
}

module.exports = { testMailServiceIntegration };
