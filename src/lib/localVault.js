/**
 * IndexedDB utility for storing encrypted files locally
 * No files are sent to the server - only stored in browser
 */

import { set, get, del, keys, clear } from 'idb-keyval';

const DB_NAME = 'PrivayGuardVault';
const DB_VERSION = 1;
const STORE_NAME = 'encryptedFiles';
const METADATA_PREFIX = 'metadata_';
const FILE_PREFIX = 'file_';

/**
 * Initialize and open IndexedDB
 * @returns {Promise<IDBDatabase>} Database instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for encrypted files
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        
        // Create indexes for efficient querying
        store.createIndex('fileName', 'fileName', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('fileType', 'fileType', { unique: false });
      }
    };
  });
}

/**
 * Generate a unique file ID
 * @returns {string} Unique file ID
 */
function generateFileId() {
  return Date.now().toString() + '_' + Math.random().toString(36).substring(2);
}

/**
 * Store encrypted file in IndexedDB using idb-keyval for better performance
 * @param {Object} encryptedFileData - Encrypted file data
 * @returns {Promise<string>} File ID
 */
export async function storeEncryptedFile(encryptedFileData) {
  try {
    const fileId = generateFileId();
    
    // Store file metadata separately from encrypted data for better performance
    const metadata = {
      id: fileId,
      fileName: encryptedFileData.fileName,
      fileType: encryptedFileData.fileType,
      fileSize: encryptedFileData.fileSize,
      timestamp: encryptedFileData.timestamp,
      salt: encryptedFileData.salt,
      iv: encryptedFileData.iv,
      keyHash: encryptedFileData.keyHash,
      storedAt: new Date().toISOString()
    };
    
    // Store metadata and encrypted data separately
    await set(METADATA_PREFIX + fileId, metadata);
    await set(FILE_PREFIX + fileId, encryptedFileData.encryptedData);
    
    return fileId;
  } catch (error) {
    console.error('Error storing encrypted file:', error);
    throw new Error('Failed to store encrypted file locally');
  }
}

/**
 * Retrieve encrypted file from IndexedDB
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} Encrypted file data
 */
export async function getEncryptedFile(fileId) {
  try {
    const metadata = await get(METADATA_PREFIX + fileId);
    const encryptedData = await get(FILE_PREFIX + fileId);
    
    if (!metadata || !encryptedData) {
      throw new Error('File not found');
    }
    
    return {
      ...metadata,
      encryptedData
    };
  } catch (error) {
    console.error('Error retrieving encrypted file:', error);
    throw new Error('Failed to retrieve encrypted file');
  }
}

/**
 * List all encrypted files in IndexedDB
 * @returns {Promise<Array>} List of encrypted file metadata
 */
export async function listEncryptedFiles() {
  try {
    const allKeys = await keys();
    const metadataKeys = allKeys.filter(key => key.startsWith(METADATA_PREFIX));
    
    const metadataPromises = metadataKeys.map(key => get(key));
    const metadataList = await Promise.all(metadataPromises);
    
    // Sort by timestamp (newest first)
    return metadataList
      .filter(metadata => metadata) // Filter out any null results
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error listing encrypted files:', error);
    throw new Error('Failed to list encrypted files');
  }
}

/**
 * Delete encrypted file from IndexedDB
 * @param {string} fileId - File ID
 * @returns {Promise<void>}
 */
export async function deleteEncryptedFile(fileId) {
  try {
    await del(METADATA_PREFIX + fileId);
    await del(FILE_PREFIX + fileId);
  } catch (error) {
    console.error('Error deleting encrypted file:', error);
    throw new Error('Failed to delete encrypted file');
  }
}

/**
 * Clear all encrypted files from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearAllFiles() {
  try {
    await clear();
  } catch (error) {
    console.error('Error clearing encrypted files:', error);
    throw new Error('Failed to clear encrypted files');
  }
}

/**
 * Export encrypted file as downloadable .vault file
 * @param {number} fileId - File ID
 * @returns {Promise<void>}
 */
export async function exportVaultFile(fileId) {
  try {
    const encryptedFileData = await getEncryptedFile(fileId);
    
    // Create vault file format
    const vaultData = {
      version: '1.0',
      type: 'privayguard-vault',
      metadata: {
        fileName: encryptedFileData.fileName,
        fileType: encryptedFileData.fileType,
        fileSize: encryptedFileData.fileSize,
        timestamp: encryptedFileData.timestamp
      },
      encryption: {
        algorithm: 'AES-GCM',
        keyDerivation: 'PBKDF2',
        salt: encryptedFileData.salt,
        iv: encryptedFileData.iv,
        keyHash: encryptedFileData.keyHash
      },
      data: encryptedFileData.encryptedData
    };
    
    // Create and download the vault file
    const blob = new Blob([JSON.stringify(vaultData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${encryptedFileData.fileName}.vault`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting vault file:', error);
    throw new Error('Failed to export vault file');
  }
}

/**
 * Import encrypted file from .vault file
 * @param {File} vaultFile - .vault file to import
 * @returns {Promise<number>} File ID of imported file
 */
export async function importVaultFile(vaultFile) {
  try {
    const fileText = await vaultFile.text();
    const vaultData = JSON.parse(fileText);
    
    // Validate vault file format
    if (vaultData.type !== 'privayguard-vault') {
      throw new Error('Invalid vault file format');
    }
    
    // Extract encrypted file data
    const encryptedFileData = {
      fileName: vaultData.metadata.fileName,
      fileType: vaultData.metadata.fileType,
      fileSize: vaultData.metadata.fileSize,
      timestamp: vaultData.metadata.timestamp,
      salt: vaultData.encryption.salt,
      iv: vaultData.encryption.iv,
      keyHash: vaultData.encryption.keyHash,
      encryptedData: vaultData.data
    };
    
    // Store in IndexedDB
    return await storeEncryptedFile(encryptedFileData);
  } catch (error) {
    console.error('Error importing vault file:', error);
    throw new Error('Failed to import vault file: ' + error.message);
  }
}

/**
 * Get storage usage statistics
 * @returns {Promise<Object>} Storage statistics
 */
export async function getStorageStats() {
  try {
    const files = await listEncryptedFiles();
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
    
    // Get browser storage estimate if available
    let storageQuota = null;
    let storageUsed = null;
    
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      storageQuota = estimate.quota;
      storageUsed = estimate.usage;
    }
    
    return {
      totalFiles,
      totalSize,
      storageQuota,
      storageUsed,
      formattedTotalSize: formatBytes(totalSize),
      formattedStorageQuota: storageQuota ? formatBytes(storageQuota) : 'Unknown',
      formattedStorageUsed: storageUsed ? formatBytes(storageUsed) : 'Unknown'
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw new Error('Failed to get storage statistics');
  }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
