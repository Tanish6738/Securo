import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, VaultPin } from '@/lib/models'
import { getNotificationsForUser } from './ws/route'

// GET - Poll for notifications
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get stored notifications
    const notifications = getNotificationsForUser(userId)
    
    // Check for pending PIN setups
    const vaultsNeedingPin = await SharedVault.find({
      memberIds: { $in: [userId] },
      isActive: true
    }).select('_id name')

    const pinSetupRequired = []
    for (const vault of vaultsNeedingPin) {
      const existingPin = await VaultPin.findOne({
        vaultId: vault._id,
        userId: userId,
        isSet: true
      })

      if (!existingPin) {
        pinSetupRequired.push({
          event: 'pin_setup_required',
          data: {
            vaultId: vault._id,
            vaultName: vault.name,
            urgent: true
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({
      notifications: [...notifications, ...pinSetupRequired],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Notifications polling error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    )
  }
}

// POST - Mark notifications as read
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds } = body

    // In a real implementation, you would mark these as read in the database
    console.log(`Marking notifications as read for user ${userId}:`, notificationIds)

    return NextResponse.json({
      message: 'Notifications marked as read'
    })
  } catch (error) {
    console.error('Mark notifications as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}