import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User } from '@/lib/models'

// GET - Search for users by username or email
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit')) || 10

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    await connectDB()

    const searchRegex = new RegExp(query.trim(), 'i')
    
    // Search users by email or username
    const users = await User.find({
      $and: [
        { clerkId: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { email: { $regex: searchRegex } },
            { username: { $regex: searchRegex } }
          ]
        }
      ]
    })
    .select('clerkId email username')
    .limit(limit)
    .sort({ username: 1, email: 1 })

    return NextResponse.json({
      users: users.map(user => ({
        id: user.clerkId,
        email: user.email,
        username: user.username || user.email.split('@')[0]
      })),
      count: users.length
    })
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
