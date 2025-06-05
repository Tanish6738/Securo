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

// Create models
const User = mongoose.models.User || mongoose.model('User', UserSchema)
const VaultItem = mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema)
const MonitoredEmail = mongoose.models.MonitoredEmail || mongoose.model('MonitoredEmail', MonitoredEmailSchema)

export { User, VaultItem, MonitoredEmail }
