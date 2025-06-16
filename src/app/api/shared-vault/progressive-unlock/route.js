import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, VaultPin, VaultHistory } from '@/lib/models'
import { sendToUser } from '@/app/api/notifications/ws/route'

// POST - Progressive PIN entry for vault unlock
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vaultId, pin } = body

    if (!vaultId || !pin) {
      return NextResponse.json({ error: 'Vault ID and PIN are required' }, { status: 400 })
    }

    await connectDB()

    // Find the vault
    const vault = await SharedVault.findOne({
      _id: vaultId,
      memberIds: { $in: [userId] },
      isActive: true
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found or not authorized' }, { status: 404 })
    }

    // Verify the current user's PIN
    const userPin = await VaultPin.findOne({
      vaultId: vault._id,
      userId: userId
    })

    if (!userPin || !userPin.isSet) {
      return NextResponse.json({ error: 'PIN not set for this vault' }, { status: 400 })
    }

    const isValidPin = await userPin.verifyPin(pin)
    if (!isValidPin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    // Log the PIN entry
    const historyEntry = new VaultHistory({
      vaultId: vault._id,
      userId,
      action: 'PIN_ENTER',
      details: 'PIN entered for progressive unlock',
      timestamp: new Date()
    })
    await historyEntry.save()

    // Check how many members have entered their PINs
    // For this demo, we'll use a simple approach with history entries
    const recentPinEntries = await VaultHistory.find({
      vaultId: vault._id,
      action: 'PIN_ENTER',
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    })

    // Get unique members who have entered PINs recently
    const membersWithPins = [...new Set(recentPinEntries.map(entry => entry.userId))]
    
    // Create member progress
    const memberProgress = await Promise.all(
      vault.memberIds.map(async (memberId) => {
        const hasEnteredPin = membersWithPins.includes(memberId)
        
        try {
          // Get user details from Clerk
          const user = await clerkClient.users.getUser(memberId)
          return {
            userId: memberId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Team Member',
            email: user.emailAddresses?.[0]?.emailAddress || '',
            pinEntered: hasEnteredPin,
            enteredAt: hasEnteredPin ? new Date().toISOString() : null
          }
        } catch (error) {
          return {
            userId: memberId,
            name: `Member ${memberId.slice(-6)}`,
            email: '',
            pinEntered: hasEnteredPin,
            enteredAt: hasEnteredPin ? new Date().toISOString() : null
          }
        }
      })
    )

    // Check if all members have entered their PINs
    const allPinsEntered = vault.memberIds.every(memberId => 
      membersWithPins.includes(memberId)
    )

    if (allPinsEntered) {
      // All members have entered PINs - unlock the vault
      await vault.unlock()

      // Log successful unlock
      const unlockHistoryEntry = new VaultHistory({
        vaultId: vault._id,
        userId,
        action: 'VAULT_UNLOCK',
        details: `Vault unlocked - all ${vault.memberIds.length} members entered PINs`,
        timestamp: new Date()
      })
      await unlockHistoryEntry.save()

      // Send unlock notifications to all members
      try {
        vault.memberIds.forEach(memberId => {
          sendToUser(memberId, 'vault_unlocked', {
            vaultId: vault._id,
            vaultName: vault.name,
            unlockDurationMinutes: vault.unlockDurationMinutes,
            unlockedAt: new Date().toISOString()
          })
        })
      } catch (notificationError) {
        console.error('Error sending unlock notifications:', notificationError)
      }

      return NextResponse.json({
        unlocked: true,
        message: 'Vault unlocked successfully',
        memberProgress,
        vault: {
          _id: vault._id,
          name: vault.name,
          isUnlocked: true,
          unlockDurationMinutes: vault.unlockDurationMinutes
        }
      })
    } else {
      // Send progress updates to all members
      try {
        vault.memberIds.forEach(memberId => {
          sendToUser(memberId, 'pinProgressUpdate', {
            vaultId: vault._id,
            vaultName: vault.name,
            memberProgress
          })
        })
      } catch (notificationError) {
        console.error('Error sending progress notifications:', notificationError)
      }

      return NextResponse.json({
        unlocked: false,
        message: 'Waiting for other members to enter their PINs',
        memberProgress,
        vault: {
          _id: vault._id,
          name: vault.name,
          memberIds: vault.memberIds
        }
      })
    }
  } catch (error) {
    console.error('Progressive PIN verification error:', error)
    return NextResponse.json(
      { error: 'Failed to process PIN entry' },
      { status: 500 }
    )
  }
}
