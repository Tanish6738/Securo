import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// User Schema for additional user data beyond Clerk
const UserSchema = new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: String,
  settings: {
    notifications: {
      breachAlerts: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      securityTips: { type: Boolean, default: false },
      productUpdates: { type: Boolean, default: false }
    },
    privacy: {
      dataCollection: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      thirdPartySharing: { type: Boolean, default: false }
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      passwordChangeReminder: { type: Boolean, default: true }
    }
  },
  vaultPassword: String, // Hashed vault password
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Pre-save middleware to hash vault password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('vaultPassword')) return next()
  
  if (this.vaultPassword) {
    this.vaultPassword = await bcrypt.hash(this.vaultPassword, 12)
  }
  
  this.updatedAt = new Date()
  next()
})

// Method to verify vault password
UserSchema.methods.verifyVaultPassword = async function(password) {
  if (!this.vaultPassword) return false
  return bcrypt.compare(password, this.vaultPassword)
}

// Vault Item Schema for storing encrypted files
const VaultItemSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  encryptedData: { 
    type: Buffer, 
    required: true 
  },
  encryptionIv: { 
    type: String, 
    required: true 
  },
  tags: [String],
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Pre-save middleware to update timestamp
VaultItemSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Monitored Email Schema for breach monitoring
const MonitoredEmailSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  isPrimary: { 
    type: Boolean, 
    default: false 
  },
  breachCount: { 
    type: Number, 
    default: 0 
  },
  lastChecked: { 
    type: Date, 
    default: Date.now 
  },
  breaches: [{
    name: String,
    domain: String,
    breachDate: Date,
    pwnCount: Number,
    dataClasses: [String],
    description: String,
    isVerified: Boolean,
    isFabricated: Boolean,
    isSpamList: Boolean,
    isRetired: Boolean,
    logoPath: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

MonitoredEmailSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// File Metadata Schema - stores only metadata, NOT actual files
const FileMetadataSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  salt: { 
    type: String, 
    required: true 
  },
  iv: { 
    type: String, 
    required: true 
  },
  keyHash: { 
    type: String, 
    required: true 
  },  localFileId: { 
    type: String, 
    required: false // Optional - for IndexedDB reference
  },
  tags: [String],
  description: String,
  isExported: { 
    type: Boolean, 
    default: false 
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to update timestamp
FileMetadataSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to create metadata entry
FileMetadataSchema.statics.createMetadata = function(userId, encryptedFileData, localFileId = null) {
  return new this({
    userId,
    fileName: encryptedFileData.fileName,
    fileType: encryptedFileData.fileType,
    fileSize: encryptedFileData.fileSize,
    salt: encryptedFileData.salt,
    iv: encryptedFileData.iv,
    keyHash: encryptedFileData.keyHash,
    localFileId
  });
};

// Shared Vault Schema for multi-member vaults
const SharedVaultSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  adminId: { 
    type: String, 
    required: true,
    index: true 
  },
  memberIds: [{ 
    type: String, 
    required: true 
  }],
  openedAt: {
    type: Date,
    default: null
  },
  unlockDurationMinutes: {
    type: Number,
    required: true,
    default: 60 // Default 1 hour
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Pre-save middleware to update timestamp
SharedVaultSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Method to check if vault is currently unlocked
SharedVaultSchema.methods.isUnlocked = function() {
  if (!this.openedAt) return false
  
  const now = new Date()
  const unlockExpiry = new Date(this.openedAt.getTime() + (this.unlockDurationMinutes * 60 * 1000))
  
  return now < unlockExpiry
}

// Method to get remaining unlock time in minutes
SharedVaultSchema.methods.getRemainingUnlockTime = function() {
  if (!this.openedAt) return 0
  
  const now = new Date()
  const unlockExpiry = new Date(this.openedAt.getTime() + (this.unlockDurationMinutes * 60 * 1000))
  
  if (now >= unlockExpiry) return 0
  
  return Math.ceil((unlockExpiry - now) / (60 * 1000))
}

// Method to unlock vault
SharedVaultSchema.methods.unlock = function() {
  this.openedAt = new Date()
  return this.save()
}

// Method to lock vault
SharedVaultSchema.methods.lock = function() {
  this.openedAt = null
  return this.save()
}

// Vault PIN Schema for storing member PINs
const VaultPinSchema = new mongoose.Schema({
  vaultId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SharedVault',
    required: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },  pinHash: { 
    type: String, 
    required: function() {
      return this.isSet === true
    }
  },
  isSet: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Compound index for vaultId + userId
VaultPinSchema.index({ vaultId: 1, userId: 1 }, { unique: true })

// Pre-save middleware to hash PIN and update timestamp
VaultPinSchema.pre('save', async function(next) {
  this.updatedAt = new Date()
  
  // If pinHash is not modified, just update timestamp
  if (!this.isModified('pinHash')) {
    return next()
  }
  
  // If pinHash is provided and not empty, hash it
  if (this.pinHash && this.pinHash.length > 0) {
    this.pinHash = await bcrypt.hash(this.pinHash, 12)
    this.isSet = true
  } else {
    // If pinHash is empty or not provided, ensure isSet is false
    this.isSet = false
  }
  
  next()
})

// Method to verify PIN
VaultPinSchema.methods.verifyPin = async function(pin) {
  if (!this.pinHash || !this.isSet) return false
  return bcrypt.compare(pin, this.pinHash)
}

// Shared Vault File Schema for storing encrypted files in shared vaults
const SharedVaultFileSchema = new mongoose.Schema({
  vaultId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SharedVault',
    required: true,
    index: true 
  },
  uploadedBy: { 
    type: String, 
    required: true,
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  encryptedData: { 
    type: Buffer, 
    required: true 
  },
  encryptionIv: { 
    type: String, 
    required: true 
  },
  tags: [String],
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Pre-save middleware to update timestamp
SharedVaultFileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Vault History Schema for audit logging
const VaultHistorySchema = new mongoose.Schema({
  vaultId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SharedVault',
    required: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  fileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SharedVaultFile',
    required: false 
  },  action: { 
    type: String, 
    required: true,
    enum: ['VAULT_CREATE', 'VAULT_ACCESS', 'VAULT_UNLOCK', 'VAULT_LOCK', 'FILE_VIEW', 'FILE_DOWNLOAD', 'FILE_UPLOAD', 'FILE_EDIT', 'FILE_DELETE', 'MEMBER_ADD', 'MEMBER_REMOVE', 'PIN_SET', 'PIN_CHANGE', 'PIN_ENTER', 'AUTO_LOCK']
  },
  details: String,
  ipAddress: String,
  userAgent: String,
  location: String,
  timestamp: { type: Date, default: Date.now }
})

// Index for efficient querying
VaultHistorySchema.index({ vaultId: 1, timestamp: -1 })
VaultHistorySchema.index({ userId: 1, timestamp: -1 })

// Create models
const User = mongoose.models.User || mongoose.model('User', UserSchema)
const VaultItem = mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema)
const MonitoredEmail = mongoose.models.MonitoredEmail || mongoose.model('MonitoredEmail', MonitoredEmailSchema)
const FileMetadata = mongoose.models.FileMetadata || mongoose.model('FileMetadata', FileMetadataSchema)
const SharedVault = mongoose.models.SharedVault || mongoose.model('SharedVault', SharedVaultSchema)
const VaultPin = mongoose.models.VaultPin || mongoose.model('VaultPin', VaultPinSchema)
const SharedVaultFile = mongoose.models.SharedVaultFile || mongoose.model('SharedVaultFile', SharedVaultFileSchema)
const VaultHistory = mongoose.models.VaultHistory || mongoose.model('VaultHistory', VaultHistorySchema)

export { User, VaultItem, MonitoredEmail, FileMetadata, SharedVault, VaultPin, SharedVaultFile, VaultHistory }
