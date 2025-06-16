// Test script to check SharedVaultFile documents in the database
// Run with: node test-shared-vault-files.mjs

import connectDB from './src/lib/database.js'
import { SharedVault, SharedVaultFile, VaultHistory } from './src/lib/models.js'

async function testSharedVaultFiles() {
  try {
    console.log('Testing SharedVaultFile database queries...')
    
    // Test connection
    await connectDB()
    console.log('✅ MongoDB connected successfully')
    
    // Get all shared vaults
    console.log('\n📁 Listing all shared vaults:')
    const vaults = await SharedVault.find({}).select('name adminId memberIds isActive')
    console.log(`Found ${vaults.length} shared vaults:`)
    vaults.forEach((vault, index) => {
      console.log(`  ${index + 1}. ${vault.name} (${vault._id})`)
      console.log(`     Admin: ${vault.adminId}`)
      console.log(`     Members: ${vault.memberIds.length}`)
      console.log(`     Active: ${vault.isActive}`)
    })
    
    // Get all shared vault files
    console.log('\n📄 Listing all shared vault files:')
    const allFiles = await SharedVaultFile.find({}).select('vaultId fileName originalName mimeType fileSize uploadedBy createdAt')
    console.log(`Found ${allFiles.length} shared vault files:`)
    allFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalName} (${file.fileName})`)
      console.log(`     Vault ID: ${file.vaultId}`)
      console.log(`     MIME Type: ${file.mimeType}`)
      console.log(`     Size: ${file.fileSize} bytes`)
      console.log(`     Uploaded by: ${file.uploadedBy}`)
      console.log(`     Created: ${file.createdAt}`)
      console.log(`     File ID: ${file._id}`)
      console.log()
    })
    
    // Group files by vault
    console.log('\n🗂️ Files grouped by vault:')
    for (const vault of vaults) {
      const vaultFiles = await SharedVaultFile.find({ vaultId: vault._id })
        .select('fileName originalName mimeType fileSize uploadedBy createdAt')
      console.log(`\n  Vault: ${vault.name} (${vault._id})`)
      console.log(`  Files: ${vaultFiles.length}`)
      vaultFiles.forEach((file, index) => {
        console.log(`    ${index + 1}. ${file.originalName}`)
        console.log(`       MIME: ${file.mimeType}`)
        console.log(`       Size: ${file.fileSize} bytes`)
        console.log(`       Uploaded: ${file.createdAt}`)
      })
    }
    
    // Check recent vault history for file uploads
    console.log('\n📈 Recent file upload history:')
    const recentUploads = await VaultHistory.find({ 
      action: 'FILE_UPLOAD' 
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .select('vaultId userId action details timestamp fileId')
    
    console.log(`Found ${recentUploads.length} recent file upload activities:`)
    recentUploads.forEach((upload, index) => {
      console.log(`  ${index + 1}. ${upload.details}`)
      console.log(`     Vault: ${upload.vaultId}`)
      console.log(`     User: ${upload.userId}`)
      console.log(`     File ID: ${upload.fileId}`)
      console.log(`     Time: ${upload.timestamp}`)
      console.log()
    })
    
    console.log('🎉 All SharedVaultFile tests completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ SharedVaultFile test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testSharedVaultFiles()
