import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User } from '@/lib/models'

// GET - Get user profile and settings
export async function GET() {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find or create user in our database
    let user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      // Create new user record
      user = new User({
        clerkId: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        username: clerkUser.username || clerkUser.firstName || 'User'
      })
      await user.save()
    }

    // Return user data without sensitive information
    const { vaultPassword, ...userResponse } = user.toObject()
    
    return NextResponse.json({
      user: {
        ...userResponse,
        hasVaultPassword: !!user.vaultPassword,
        clerkUser: {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          username: clerkUser.username,
          imageUrl: clerkUser.imageUrl
        }
      }
    })
  } catch (error) {
    console.error('User GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    )
  }
}

// POST - Update user settings
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings, vaultPassword } = body

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update settings if provided
    if (settings) {
      user.settings = { ...user.settings, ...settings }
    }

    // Update vault password if provided
    if (vaultPassword) {
      user.vaultPassword = vaultPassword
    }

    await user.save()

    // Return updated user data without sensitive information
    const { vaultPassword: _, ...userResponse } = user.toObject()

    return NextResponse.json({
      message: 'User settings updated successfully',
      user: {
        ...userResponse,
        hasVaultPassword: !!user.vaultPassword
      }
    })
  } catch (error) {
    console.error('User POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}

// PUT - Verify vault password
export async function PUT(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.vaultPassword) {
      return NextResponse.json({ error: 'No vault password set' }, { status: 400 })
    }

    const isValid = await user.verifyVaultPassword(password)

    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'Password verified' : 'Invalid password'
    })
  } catch (error) {
    console.error('Vault password verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    )
  }
}
