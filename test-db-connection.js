// Test script to verify MongoDB connection and basic functionality
// Run with: node test-db-connection.js

import connectDB from './src/lib/database.js'
import { User, VaultItem, MonitoredEmail } from './src/lib/models.js'

async function testDatabaseConnection() {
  try {
    console.log('Testing MongoDB connection...')
    
    // Test connection
    await connectDB()
    console.log('✅ MongoDB connected successfully')
    
    // Test User model
    console.log('Testing User model...')
    const testUser = await User.findOne({ clerkId: 'test-clerk-id' })
    console.log('✅ User model accessible')
    
    // Test VaultItem model
    console.log('Testing VaultItem model...')
    const testVaultItem = await VaultItem.findOne({ userId: 'test-user-id' })
    console.log('✅ VaultItem model accessible')
    
    // Test MonitoredEmail model
    console.log('Testing MonitoredEmail model...')
    const testEmail = await MonitoredEmail.findOne({ userId: 'test-user-id' })
    console.log('✅ MonitoredEmail model accessible')
    
    console.log('🎉 All database tests passed!')
    console.log('Database is ready for use.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure MongoDB is running:')
      console.log('   - If using local MongoDB: Start the MongoDB service')
      console.log('   - If using Docker: docker start mongodb')
      console.log('   - If using Atlas: Check your connection string')
    }
    
    process.exit(1)
  }
}

testDatabaseConnection()
