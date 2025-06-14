/**
 * Client-side file encryption using Web Crypto API
 * Files are encrypted in the browser and never sent to the server
 */

/**
 * Convert Uint8Array to base64 string safely (avoiding stack overflow)
 * @param {Uint8Array} uint8Array - Array to convert
 * @returns {string} Base64 string
 */
function uint8ArrayToBase64(uint8Array) {
  let binary = "";
  const chunkSize = 8192; // Process in chunks to avoid stack overflow

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array safely
 * @param {string} base64 - Base64 string
 * @returns {Uint8Array} Converted array
 */
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const uint8Array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }

  return uint8Array;
}

/**
 * Generate a cryptographically secure random salt
 * @param {number} length - Length of salt in bytes
 * @returns {Uint8Array} Random salt
 */
function generateSalt(length = 32) {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Generate a cryptographically secure random IV
 * @param {number} length - Length of IV in bytes
 * @returns {Uint8Array} Random IV
 */
function generateIV(length = 12) {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive encryption key from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation
 * @param {number} iterations - Number of PBKDF2 iterations
 * @returns {Promise<CryptoKey>} Derived encryption key
 */
async function deriveKey(password, salt, iterations = 100000) {
  const passwordBuffer = new TextEncoder().encode(password);
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive the actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false, // Keep non-extractable for security
    ["encrypt", "decrypt"]
  );
}

/**
 * Create a hash of the derived key for validation purposes
 * @deprecated Use deriveKeyHash instead for better security
 * @param {CryptoKey} key - The derived encryption key
 * @returns {Promise<string>} Base64 encoded hash of the key
 */
async function createKeyHash(key) {
  // This function is deprecated - use deriveKeyHash instead
  throw new Error(
    "createKeyHash is deprecated. Use deriveKeyHash for better security."
  );
}

/**
 * Derive a separate key hash for validation purposes (more secure approach)
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation
 * @param {number} iterations - Number of PBKDF2 iterations
 * @returns {Promise<string>} Base64 encoded key hash
 */
async function deriveKeyHash(password, salt, iterations = 100000) {
  const passwordBuffer = new TextEncoder().encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive a separate extractable key just for validation
  const hashKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    true, // Extractable for hashing
    ["sign"]
  );
  // Export and hash the key
  const keyBuffer = await crypto.subtle.exportKey("raw", hashKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyBuffer);

  // Convert to base64
  return uint8ArrayToBase64(new Uint8Array(hashBuffer));
}

/**
 * Encrypt a file using AES-GCM
 * @param {File} file - File to encrypt
 * @param {string} password - Password for encryption
 * @returns {Promise<Object>} Encryption result with metadata
 */
export async function encryptFile(file, password) {
  try {
    // Generate salt and IV
    const salt = generateSalt();
    const iv = generateIV();

    // Derive encryption key
    const key = await deriveKey(password, salt);

    // Create key hash for validation using the more secure method
    const keyHash = await deriveKeyHash(password, salt);

    // Read file as array buffer
    const fileBuffer = await file.arrayBuffer();

    // Encrypt the file
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      fileBuffer
    );
    // Convert to base64 for storage
    const encryptedData = uint8ArrayToBase64(new Uint8Array(encryptedBuffer));
    const saltBase64 = uint8ArrayToBase64(salt);
    const ivBase64 = uint8ArrayToBase64(iv);

    return {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      encryptedData, // This will be stored locally, not in DB
      salt: saltBase64,
      iv: ivBase64,
      keyHash,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt file: " + error.message);
  }
}

/**
 * Decrypt a file using AES-GCM
 * @param {Object} encryptedFileData - Encrypted file data
 * @param {string} password - Password for decryption
 * @returns {Promise<File>} Decrypted file
 */
export async function decryptFile(encryptedFileData, password) {
  try {
    const { fileName, fileType, encryptedData, salt, iv, keyHash } =
      encryptedFileData;
    // Convert base64 back to Uint8Array
    const saltBuffer = base64ToUint8Array(salt);
    const ivBuffer = base64ToUint8Array(iv);
    const encryptedBuffer = base64ToUint8Array(encryptedData);

    // Derive the same key
    const key = await deriveKey(password, saltBuffer);

    // Verify the key hash using the same secure method
    const derivedKeyHash = await deriveKeyHash(password, saltBuffer);
    if (derivedKeyHash !== keyHash) {
      throw new Error("Invalid password");
    }

    // Decrypt the file
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      key,
      encryptedBuffer
    );

    // Create and return the decrypted file
    return new File([decryptedBuffer], fileName, { type: fileType });
  } catch (error) {
    console.error("Decryption error:", error);
    if (error.message === "Invalid password") {
      throw error;
    }
    throw new Error("Failed to decrypt file: " + error.message);
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  let score = 0;
  const feedback = [];

  if (password.length >= minLength) {
    score += 1;
  } else {
    feedback.push(`Password must be at least ${minLength} characters long`);
  }

  if (hasUpperCase) score += 1;
  else feedback.push("Password must contain at least one uppercase letter");

  if (hasLowerCase) score += 1;
  else feedback.push("Password must contain at least one lowercase letter");

  if (hasNumbers) score += 1;
  else feedback.push("Password must contain at least one number");

  if (hasSpecialChar) score += 1;
  else feedback.push("Password must contain at least one special character");

  let strength = "Very Weak";
  if (score >= 5) strength = "Very Strong";
  else if (score >= 4) strength = "Strong";
  else if (score >= 3) strength = "Medium";
  else if (score >= 2) strength = "Weak";

  return {
    score,
    strength,
    isValid: score >= 4,
    feedback,
  };
}
