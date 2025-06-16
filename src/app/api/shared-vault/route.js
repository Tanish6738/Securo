import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User, SharedVault, VaultPin, VaultHistory } from '@/lib/models'
import { broadcastToUsers, sendToUser } from '@/app/api/notifications/ws/route'

// GET - Retrieve shared vaults for user (where user is admin or member)
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Find vaults where user is admin or member
    const vaults = await SharedVault.find({
      $or: [
        { adminId: userId },
        { memberIds: { $in: [userId] } }
      ],
      isActive: true
    }).sort({ createdAt: -1 })

    // Get member details for each vault
    const vaultsWithMembers = await Promise.all(
      vaults.map(async (vault) => {
        const memberUsers = await User.find({
          clerkId: { $in: vault.memberIds }
        }).select('clerkId email username')

        const adminUser = await User.findOne({
          clerkId: vault.adminId
        }).select('clerkId email username')

        // Check PIN status for each member
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

        return {
          ...vault.toObject(),
          admin: adminUser,
          members: memberUsers,
          memberPinStatus,
          isUnlocked: vault.isUnlocked(),
          remainingUnlockTime: vault.getRemainingUnlockTime()
        }
      })
    )
    
    return NextResponse.json({
      vaults: vaultsWithMembers,
      count: vaultsWithMembers.length
    })
  } catch (error) {
    console.error('Shared Vault GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve shared vaults' },
      { status: 500 }
    )
  }
}

// POST - Create new shared vault
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, memberEmails, unlockDurationMinutes, memberPins } = body

    if (!name) {
      return NextResponse.json({ error: 'Vault name is required' }, { status: 400 })
    }

    if (!memberEmails || memberEmails.length === 0) {
      return NextResponse.json({ error: 'At least one member is required' }, { status: 400 })
    }

    if (!unlockDurationMinutes || unlockDurationMinutes < 1) {
      return NextResponse.json({ error: 'Valid unlock duration is required' }, { status: 400 })
    }

    await connectDB()

    // Find users by email
    const memberUsers = await User.find({
      email: { $in: memberEmails }
    })

    if (memberUsers.length !== memberEmails.length) {
      const foundEmails = memberUsers.map(u => u.email)
      const notFound = memberEmails.filter(email => !foundEmails.includes(email))
      return NextResponse.json({ 
        error: `Users not found for emails: ${notFound.join(', ')}` 
      }, { status: 400 })
    }

    const memberIds = memberUsers.map(u => u.clerkId)

    // Ensure admin is included in members
    if (!memberIds.includes(userId)) {
      memberIds.push(userId)
    }

    // Create shared vault
    const vault = new SharedVault({
      name,
      description,
      adminId: userId,
      memberIds,
      unlockDurationMinutes
    })

    await vault.save()

    // Create PIN entries for each member
    await Promise.all(
      memberIds.map(async (memberId) => {
        const pinEntry = new VaultPin({
          vaultId: vault._id,
          userId: memberId,
          pinHash: memberPins && memberPins[memberId] ? memberPins[memberId] : '',
          isSet: memberPins && memberPins[memberId] ? true : false
        })
        await pinEntry.save()
      })
    )    // Log vault creation
    const historyEntry = new VaultHistory({
      vaultId: vault._id,
      userId,
      action: 'VAULT_CREATE',
      details: `Created vault "${name}" with ${memberIds.length} members`,
      timestamp: new Date()
    })
    await historyEntry.save()

    // Get admin user details for notifications
    const adminUser = await User.findOne({ clerkId: userId })

    // Send notifications to new members (excluding admin)
    const newMemberIds = memberIds.filter(id => id !== userId)
    if (newMemberIds.length > 0) {
      try {
        // Send WebSocket notifications
        newMemberIds.forEach(memberId => {
          sendToUser(memberId, 'vault_invitation', {
            vaultId: vault._id,
            vaultName: vault.name,
            adminName: adminUser?.username || adminUser?.email?.split('@')[0] || 'Admin',
            adminEmail: adminUser?.email,
            requiresPinSetup: true
          })
        })
        
        // Also send PIN setup required notifications
        newMemberIds.forEach(memberId => {
          sendToUser(memberId, 'pin_setup_required', {
            vaultId: vault._id,
            vaultName: vault.name,
            urgent: true
          })
        })
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Don't fail the vault creation if notifications fail
      }
    }

    return NextResponse.json({
      message: 'Shared vault created successfully',
      vault: {
        ...vault.toObject(),
        memberCount: memberIds.length
      }
    })
  } catch (error) {
    console.error('Shared Vault POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create shared vault' },
      { status: 500 }
    )
  }
}

// PUT - Update shared vault (admin only)
export async function PUT(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vaultId, name, description, unlockDurationMinutes, memberEmails } = body

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    await connectDB()

    const vault = await SharedVault.findOne({
      _id: vaultId,
      adminId: userId,
      isActive: true
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found or not authorized' }, { status: 404 })
    }

    // Update basic info
    if (name) vault.name = name
    if (description !== undefined) vault.description = description
    if (unlockDurationMinutes) vault.unlockDurationMinutes = unlockDurationMinutes

    // Update members if provided
    if (memberEmails) {
      const memberUsers = await User.find({
        email: { $in: memberEmails }
      })

      if (memberUsers.length !== memberEmails.length) {
        const foundEmails = memberUsers.map(u => u.email)
        const notFound = memberEmails.filter(email => !foundEmails.includes(email))
        return NextResponse.json({ 
          error: `Users not found for emails: ${notFound.join(', ')}` 
        }, { status: 400 })
      }

      const newMemberIds = memberUsers.map(u => u.clerkId)
      
      // Ensure admin is included
      if (!newMemberIds.includes(userId)) {
        newMemberIds.push(userId)
      }

      const oldMemberIds = vault.memberIds
      vault.memberIds = newMemberIds

      // Add PIN entries for new members
      const newMembers = newMemberIds.filter(id => !oldMemberIds.includes(id))
      await Promise.all(
        newMembers.map(async (memberId) => {
          const pinEntry = new VaultPin({
            vaultId: vault._id,
            userId: memberId,
            isSet: false
          })
          await pinEntry.save()
        })
      )

      // Remove PIN entries for removed members
      const removedMembers = oldMemberIds.filter(id => !newMemberIds.includes(id))
      if (removedMembers.length > 0) {
        await VaultPin.deleteMany({
          vaultId: vault._id,
          userId: { $in: removedMembers }
        })
      }
    }

    await vault.save()

    // Log the update
    const historyEntry = new VaultHistory({
      vaultId: vault._id,
      userId,
      action: 'VAULT_ACCESS',
      details: 'Updated vault settings',
      timestamp: new Date()
    })
    await historyEntry.save()

    return NextResponse.json({
      message: 'Vault updated successfully',
      vault: vault.toObject()
    })
  } catch (error) {
    console.error('Shared Vault PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update vault' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate shared vault (admin only)
export async function DELETE(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vaultId = searchParams.get('id')

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID required' }, { status: 400 })
    }

    await connectDB()

    const vault = await SharedVault.findOne({
      _id: vaultId,
      adminId: userId,
      isActive: true
    })

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found or not authorized' }, { status: 404 })
    }

    // Deactivate instead of delete to preserve history
    vault.isActive = false
    await vault.save()

    // Log the deactivation
    const historyEntry = new VaultHistory({
      vaultId: vault._id,
      userId,
      action: 'VAULT_ACCESS',
      details: 'Deactivated vault',
      timestamp: new Date()
    })
    await historyEntry.save()

    return NextResponse.json({
      message: 'Vault deactivated successfully'
    })
  } catch (error) {
    console.error('Shared Vault DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate vault' },
      { status: 500 }
    )
  }
}
