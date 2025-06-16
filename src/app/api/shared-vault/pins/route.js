import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, VaultPin, VaultHistory } from '@/lib/models'

// POST - Set or update user's PIN for a vault
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vaultId, pin, targetUserId } = body

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 characters' }, { status: 400 })
    }

    await connectDB()

    // Find the vault
    const vault = await SharedVault.findOne({
      _id: vaultId,
      isActive: true
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    // Determine which user's PIN to set
    const userToSetPin = targetUserId || userId

    // Check authorization
    const isAdmin = vault.adminId === userId
    const isSelfSetting = userToSetPin === userId
    const isMemberOfVault = vault.memberIds.includes(userToSetPin)

    if (!isMemberOfVault) {
      return NextResponse.json({ error: 'User is not a member of this vault' }, { status: 403 })
    }

    // Only admin can set others' PINs, or users can set their own
    if (!isAdmin && !isSelfSetting) {
      return NextResponse.json({ error: 'Not authorized to set PIN for this user' }, { status: 403 })
    }

    // Find or create PIN entry
    let pinEntry = await VaultPin.findOne({
      vaultId: vault._id,
      userId: userToSetPin
    })

    if (!pinEntry) {
      pinEntry = new VaultPin({
        vaultId: vault._id,
        userId: userToSetPin
      })
    }

    // Set the PIN (will be hashed by pre-save middleware)
    pinEntry.pinHash = pin
    await pinEntry.save()

    // Log the PIN setting
    const historyEntry = new VaultHistory({
      vaultId: vault._id,
      userId,
      action: pinEntry.isSet ? 'PIN_CHANGE' : 'PIN_SET',
      details: isSelfSetting ? 'Set own PIN' : `Set PIN for user ${userToSetPin}`,
      timestamp: new Date()
    })
    await historyEntry.save()

    return NextResponse.json({
      message: 'PIN set successfully',
      vaultId: vault._id,
      userId: userToSetPin
    })
  } catch (error) {
    console.error('PIN setting error:', error)
    return NextResponse.json(
      { error: 'Failed to set PIN' },
      { status: 500 }
    )
  }
}

// GET - Get PIN status for vault members
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
    const pinStatuses = await Promise.all(
      vault.memberIds.map(async (memberId) => {
        const pin = await VaultPin.findOne({
          vaultId: vault._id,
          userId: memberId
        })
        
        return {
          userId: memberId,
          hasPinSet: pin ? pin.isSet : false,
          pinSetAt: pin ? pin.updatedAt : null
        }
      })
    )

    // Check if current user has PIN
    const currentUserPin = await VaultPin.findOne({
      vaultId: vault._id,
      userId
    })
    const hasPin = currentUserPin ? currentUserPin.isSet : false

    // Find members without PINs
    const membersWithoutPins = pinStatuses
      .filter(status => !status.hasPinSet)
      .map(status => status.userId)

    // Check if all members have PINs
    const allMembersHavePins = pinStatuses.every(status => status.hasPinSet)

    return NextResponse.json({
      vaultId: vault._id,
      hasPin,
      allMembersHavePins,
      membersWithoutPins,
      pinStatuses: pinStatuses.reduce((acc, status) => {
        acc[status.userId] = {
          hasPinSet: status.hasPinSet,
          pinSetAt: status.pinSetAt
        }
        return acc
      }, {})
    })
  } catch (error) {
    console.error('PIN status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check PIN status' },
      { status: 500 }
    )
  }
}

// DELETE - Remove user's PIN (admin only or self)
export async function DELETE(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vaultId = searchParams.get('vaultId')
    const targetUserId = searchParams.get('userId')

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    await connectDB()

    const vault = await SharedVault.findOne({
      _id: vaultId,
      isActive: true
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    const userToRemovePin = targetUserId || userId
    const isAdmin = vault.adminId === userId
    const isSelfRemoving = userToRemovePin === userId

    if (!isAdmin && !isSelfRemoving) {
      return NextResponse.json({ error: 'Not authorized to remove PIN for this user' }, { status: 403 })
    }

    // Find and remove PIN
    const pinEntry = await VaultPin.findOne({
      vaultId: vault._id,
      userId: userToRemovePin
    })

    if (pinEntry) {
      await VaultPin.deleteOne({ _id: pinEntry._id })

      // Log the PIN removal
      const historyEntry = new VaultHistory({
        vaultId: vault._id,
        userId,
        action: 'PIN_CHANGE',
        details: isSelfRemoving ? 'Removed own PIN' : `Removed PIN for user ${userToRemovePin}`,
        timestamp: new Date()
      })
      await historyEntry.save()
    }

    return NextResponse.json({
      message: 'PIN removed successfully'
    })
  } catch (error) {
    console.error('PIN removal error:', error)
    return NextResponse.json(
      { error: 'Failed to remove PIN' },
      { status: 500 }
    )
  }
}
