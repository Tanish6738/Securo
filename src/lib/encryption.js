import CryptoJS from 'crypto-js'

/**
 * Encrypts a file buffer using AES encryption
 * @param {Buffer} fileBuffer - The file buffer to encrypt
 * @param {string} password - The password to use for encryption
 * @returns {Object} - Object containing encrypted data and IV
 */
export function encryptFile(fileBuffer, password) {
  try {
    // Generate a random salt for key derivation
    const salt = CryptoJS.lib.WordArray.random(256/8)
    
    // Derive key using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    })
    
    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(128/8)
    
    // Convert buffer to WordArray
    const fileWordArray = CryptoJS.lib.WordArray.create(fileBuffer)
    
    // Encrypt the file data
    const encrypted = CryptoJS.AES.encrypt(fileWordArray, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // Combine salt, iv, and encrypted data
    const combined = salt.concat(iv).concat(encrypted.ciphertext)
    
    return {
      encryptedData: Buffer.from(combined.toString(CryptoJS.enc.Base64), 'base64'),
      iv: iv.toString(CryptoJS.enc.Hex),
      salt: salt.toString(CryptoJS.enc.Hex)
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt file')
  }
}

/**
 * Decrypts a file buffer using AES decryption
 * @param {Buffer} encryptedBuffer - The encrypted file buffer
 * @param {string} password - The password used for encryption
 * @param {string} iv - The initialization vector used during encryption
 * @returns {Buffer} - The decrypted file buffer
 */
export function decryptFile(encryptedBuffer, password) {
  try {
    // Convert buffer to base64 string then to WordArray
    const encryptedWordArray = CryptoJS.enc.Base64.parse(encryptedBuffer.toString('base64'))
    
    // Extract salt (first 32 bytes), IV (next 16 bytes), and encrypted data
    const saltSize = 256/8
    const ivSize = 128/8
    
    const salt = CryptoJS.lib.WordArray.create(
      encryptedWordArray.words.slice(0, saltSize/4),
      saltSize
    )
    
    const iv = CryptoJS.lib.WordArray.create(
      encryptedWordArray.words.slice(saltSize/4, (saltSize + ivSize)/4),
      ivSize
    )
    
    const encryptedData = CryptoJS.lib.WordArray.create(
      encryptedWordArray.words.slice((saltSize + ivSize)/4),
      encryptedWordArray.sigBytes - saltSize - ivSize
    )
    
    // Derive the same key using the extracted salt
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    })
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedData },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    
    // Convert back to buffer
    const decryptedBuffer = Buffer.from(decrypted.toString(CryptoJS.enc.Base64), 'base64')
    
    return decryptedBuffer
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt file - invalid password or corrupted data')
  }
}

/**
 * Generates a secure random password
 * @param {number} length - Length of the password to generate
 * @returns {string} - Generated password
 */
export function generateSecurePassword(length = 32) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  
  return password
}

/**
 * Validates if a password meets security requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export function validatePassword(password) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  let score = 0
  const feedback = []
  
  if (password.length >= minLength) {
    score += 1
  } else {
    feedback.push(`Password must be at least ${minLength} characters long`)
  }
  
  if (hasUpperCase) {
    score += 1
  } else {
    feedback.push('Password must contain at least one uppercase letter')
  }
  
  if (hasLowerCase) {
    score += 1
  } else {
    feedback.push('Password must contain at least one lowercase letter')
  }
  
  if (hasNumbers) {
    score += 1
  } else {
    feedback.push('Password must contain at least one number')
  }
  
  if (hasSpecialChar) {
    score += 1
  } else {
    feedback.push('Password must contain at least one special character')
  }
  
  let strength = 'Very Weak'
  if (score >= 5) strength = 'Very Strong'
  else if (score >= 4) strength = 'Strong'
  else if (score >= 3) strength = 'Medium'
  else if (score >= 2) strength = 'Weak'
  
  return {
    score,
    strength,
    isValid: score >= 4,
    feedback
  }
}
