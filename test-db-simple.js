const { MongoClient } = require('mongodb');

async function testDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/privayguard';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check SharedVaultFile collection
    const filesCollection = db.collection('sharedvaultfiles');
    const allFiles = await filesCollection.find({}).toArray();
    
    console.log(`\n📄 Found ${allFiles.length} files in SharedVaultFile collection:`);
    allFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalName || file.fileName}`);
      console.log(`     Vault ID: ${file.vaultId}`);
      console.log(`     MIME Type: ${file.mimeType}`);
      console.log(`     Size: ${file.fileSize} bytes`);
      console.log(`     Created: ${file.createdAt}`);
      console.log(`     _id: ${file._id}`);
      console.log();
    });
    
    // Check shared vaults
    const vaultsCollection = db.collection('sharedvaults');
    const allVaults = await vaultsCollection.find({}).toArray();
    
    console.log(`\n📁 Found ${allVaults.length} shared vaults:`);
    allVaults.forEach((vault, index) => {
      console.log(`  ${index + 1}. ${vault.name}`);
      console.log(`     _id: ${vault._id}`);
      console.log(`     Admin: ${vault.adminId}`);
      console.log(`     Members: ${vault.memberIds?.length || 0}`);
      console.log(`     Active: ${vault.isActive}`);
      console.log();
    });
    
    // Count files per vault
    for (const vault of allVaults) {
      const fileCount = await filesCollection.countDocuments({ vaultId: vault._id });
      console.log(`Vault "${vault.name}" has ${fileCount} files`);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

testDatabase();
