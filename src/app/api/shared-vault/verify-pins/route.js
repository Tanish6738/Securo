import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, VaultPin, VaultHistory } from '@/lib/models'
import { broadcastToUsers, sendToUser } from '@/app/api/notifications/ws/route'

// POST - Verify PINs and unlock vault
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vaultId, userPins } = body

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    if (!userPins || Object.keys(userPins).length === 0) {
      return NextResponse.json({ error: 'User PINs are required' }, { status: 400 })
    }

    await connectDB()

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
      return NextResponse.json({ error: 'Vault not found or not authorized' }, { status: 404 })
    }

    // Get all required PINs for this vault
    const requiredPins = await VaultPin.find({
      vaultId: vault._id,
      userId: { $in: vault.memberIds }
    })

    // Check if all members have PINs set
    const membersWithoutPins = vault.memberIds.filter(memberId => {
      const pin = requiredPins.find(p => p.userId === memberId)
      return !pin || !pin.isSet
    })

    if (membersWithoutPins.length > 0) {
      return NextResponse.json({ 
        error: 'Not all members have set their PINs',
        membersWithoutPins
      }, { status: 400 })
    }

    // Check if PINs are provided for all members
    const providedUserIds = Object.keys(userPins)
    const missingPins = vault.memberIds.filter(memberId => !providedUserIds.includes(memberId))

    if (missingPins.length > 0) {
      return NextResponse.json({
        error: 'PINs required for all members',
        missingMembers: missingPins
      }, { status: 400 })
    }

    // Verify all PINs
    const pinVerificationResults = await Promise.all(
      vault.memberIds.map(async (memberId) => {
        const pin = requiredPins.find(p => p.userId === memberId)
        const providedPin = userPins[memberId]
        
        if (!pin || !providedPin) {
          return { userId: memberId, valid: false, error: 'PIN not found' }
        }

        try {
          const isValid = await pin.verifyPin(providedPin)
          return { userId: memberId, valid: isValid }
        } catch (error) {
          return { userId: memberId, valid: false, error: 'PIN verification failed' }
        }
      })
    )

    // Check if all PINs are valid
    const invalidPins = pinVerificationResults.filter(result => !result.valid)
    
    if (invalidPins.length > 0) {
      // Log failed unlock attempt
      const historyEntry = new VaultHistory({
        vaultId: vault._id,
        userId,
        action: 'PIN_ENTER',
        details: `Failed unlock attempt - ${invalidPins.length} invalid PINs`,
        timestamp: new Date()
      })
      await historyEntry.save()

      return NextResponse.json({
        error: 'One or more PINs are invalid',
        invalidPins: invalidPins.map(p => p.userId)
      }, { status: 401 })
    }    // All PINs are valid - unlock the vault
    await vault.unlock()

    // Log successful unlock
    const historyEntry = new VaultHistory({
      vaultId: vault._id,
      userId,
      action: 'VAULT_UNLOCK',
      details: `Vault unlocked successfully by all ${vault.memberIds.length} members`,
      timestamp: new Date()
    })
    await historyEntry.save()

    // Log PIN entries for each member
    await Promise.all(
      vault.memberIds.map(async (memberId) => {
        const memberHistoryEntry = new VaultHistory({
          vaultId: vault._id,
          userId: memberId,
          action: 'PIN_ENTER',
          details: 'Successfully entered PIN for vault unlock',
          timestamp: new Date()
        })
        await memberHistoryEntry.save()
      })
    )

    // Send notifications to all members about successful unlock
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
      // Don't fail the unlock if notifications fail
    }

    return NextResponse.json({
      message: 'Vault unlocked successfully',
      unlocked: true,
      vault: {
        id: vault._id,
        name: vault.name,
        isUnlocked: true,
        memberIds: vault.memberIds,
        openedAt: vault.openedAt,
        remainingUnlockTime: vault.getRemainingUnlockTime()
      }
    })
  } catch (error) {
    console.error('PIN verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify PINs' },
      { status: 500 }
    )
  }
}

// GET - Check vault unlock status
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vaultId = searchParams.get('vaultId')

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    await connectDB()

    const vault = await SharedVault.findOne({
      _id: vaultId,
      $or: [
        { adminId: userId },
        { memberIds: { $in: [userId] } }
      ],
      isActive: true
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found or not authorized' }, { status: 404 })
    }

    // Get PIN status for all members
    const memberPinStatus = await Promise.all(
      vault.memberIds.map(async (memberId) => {
        const pin = await VaultPin.findOne({
          vaultId: vault._id,
          userId: memberId
        })
        return {
          userId: memberId,
          hasPinSet: pin ? pin.isSet : false
        }
      })
    )

    return NextResponse.json({
      vault: {
        id: vault._id,
        name: vault.name,
        isUnlocked: vault.isUnlocked(),
        openedAt: vault.openedAt,
        remainingUnlockTime: vault.getRemainingUnlockTime(),
        unlockDurationMinutes: vault.unlockDurationMinutes,
        memberCount: vault.memberIds.length,
        memberPinStatus
      }
    })
  } catch (error) {
    console.error('Vault status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check vault status' },
      { status: 500 }
    )
  }
}
