import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, VaultHistory, User } from '@/lib/models'

// GET - Get vault history/audit logs
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vaultId = searchParams.get('vaultId')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    await connectDB()

    // Check if user has access to this vault
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

    // Get history entries
    const historyEntries = await VaultHistory.find({
      vaultId: vault._id
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(offset)
    .populate('fileId', 'originalName fileName')

    // Get user details for each entry
    const userIds = [...new Set(historyEntries.map(entry => entry.userId))]
    const users = await User.find({
      clerkId: { $in: userIds }
    }).select('clerkId email username')

    const userMap = users.reduce((acc, user) => {
      acc[user.clerkId] = user
      return acc
    }, {})

    // Format history entries with user details
    const formattedHistory = historyEntries.map(entry => ({
      _id: entry._id,
      action: entry.action,
      details: entry.details,
      timestamp: entry.timestamp,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      location: entry.location,
      user: userMap[entry.userId] ? {
        id: userMap[entry.userId].clerkId,
        email: userMap[entry.userId].email,
        username: userMap[entry.userId].username
      } : { id: entry.userId, email: 'Unknown', username: 'Unknown' },
      file: entry.fileId ? {
        id: entry.fileId._id,
        originalName: entry.fileId.originalName,
        fileName: entry.fileId.fileName
      } : null
    }))

    // Get total count for pagination
    const totalCount = await VaultHistory.countDocuments({
      vaultId: vault._id
    })

    return NextResponse.json({
      history: formattedHistory,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      vault: {
        id: vault._id,
        name: vault.name
      }
    })
  } catch (error) {
    console.error('Vault history GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve vault history' },
      { status: 500 }
    )
  }
}
