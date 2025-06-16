import { SharedVault, VaultHistory } from '@/lib/models'

/**
 * Middleware to check if a shared vault is unlocked and auto-lock if expired
 * @param {string} vaultId - The vault ID to check
 * @param {string} userId - The user ID making the request
 * @returns {Object} { vault, error, status }
 */
export async function checkVaultUnlocked(vaultId, userId) {
  try {
    // Find the vault
    const vault = await SharedVault.findOne({
      _id: vaultId,
      $or: [
        { adminId: userId },
        { memberIds: { $in: [userId] } }
      ],
      isActive: true
    })

    if (!vault) {
      return { error: 'Vault not found or not authorized', status: 404 }
    }

    // Check if vault is unlocked
    if (!vault.isUnlocked()) {
      // Auto-lock if expired
      if (vault.openedAt) {
        await vault.lock()
        
        // Log auto-lock
        const historyEntry = new VaultHistory({
          vaultId: vault._id,
          userId,
          action: 'AUTO_LOCK',
          details: 'Vault auto-locked due to timeout',
          timestamp: new Date()
        })
        await historyEntry.save()
      }

      return { 
        error: 'Vault is locked. All members must enter their PINs to unlock.', 
        status: 423,
        vault 
      }
    }

    return { vault }
  } catch (error) {
    console.error('Vault unlock check error:', error)
    return { error: 'Failed to check vault status', status: 500 }
  }
}

/**
 * Log vault activity to history
 * @param {string} vaultId - The vault ID
 * @param {string} userId - The user ID
 * @param {string} action - The action performed
 * @param {string} details - Additional details
 * @param {string} fileId - Optional file ID
 * @param {Object} request - Optional request object for IP/user agent
 */
export async function logVaultActivity(vaultId, userId, action, details, fileId = null, request = null) {
  try {
    const historyEntry = new VaultHistory({
      vaultId,
      userId,
      fileId,
      action,
      details,
      ipAddress: request ? getClientIP(request) : null,
      userAgent: request ? request.headers.get('user-agent') : null,
      timestamp: new Date()
    })
    
    await historyEntry.save()
  } catch (error) {
    console.error('Failed to log vault activity:', error)
  }
}

/**
 * Get client IP address from request
 * @param {Request} request - The request object
 * @returns {string} IP address
 */
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}
