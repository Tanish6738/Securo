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

    await connectDB()    // Find or create user in our database
    let user = await User.findOne({ clerkId: userId })
    
    if (!user) {
      // Create new user record
      console.log('Creating new user in database via API call:', userId)
      user = new User({
        clerkId: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        username: clerkUser.username || clerkUser.firstName || 'User',
        settings: {
          notifications: {
            breachAlerts: true,
            weeklyReports: true,
            securityTips: false,
            productUpdates: false
          },
          privacy: {
            dataCollection: false,
            analytics: false,
            thirdPartySharing: false
          },
          security: {
            twoFactorEnabled: false,
            sessionTimeout: 30,
            passwordChangeReminder: true
          }
        }
      })
      await user.save()
      console.log('Successfully created user in database via API call:', userId)
    } else {
      console.log('User already exists in database:', userId)
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

// POST - Create or update user
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clerkId, email, firstName, lastName, imageUrl, settings, vaultPassword } = body

    await connectDB()

    // Check if user already exists
    let user = await User.findOne({ clerkId: userId })
    
    if (user) {
      // Update existing user with new data
      if (email) user.email = email
      if (firstName) user.username = firstName
      if (settings) user.settings = { ...user.settings, ...settings }
      if (vaultPassword) user.vaultPassword = vaultPassword
      user.updatedAt = new Date()
      
      await user.save()
      
      const { vaultPassword: _, ...userResponse } = user.toObject()
      
      return NextResponse.json({ 
        success: true, 
        message: 'User updated successfully',
        user: {
          ...userResponse,
          hasVaultPassword: !!user.vaultPassword
        }
      })
    }

    // Create new user if clerkId is provided
    if (clerkId && clerkId === userId) {
      user = new User({
        clerkId: userId,
        email: email,
        username: firstName || 'User',
        settings: {
          notifications: {
            breachAlerts: true,
            weeklyReports: true,
            securityTips: false,
            productUpdates: false
          },
          privacy: {
            dataCollection: false,
            analytics: false,
            thirdPartySharing: false
          },
          security: {
            twoFactorEnabled: false,
            sessionTimeout: 30,
            passwordChangeReminder: true
          }
        }
      })

      await user.save()
      console.log('✅ New user created in database:', userId)

      const { vaultPassword: _, ...userResponse } = user.toObject()

      return NextResponse.json({ 
        success: true, 
        message: 'User created successfully',
        user: {
          ...userResponse,
          hasVaultPassword: !!user.vaultPassword
        }
      })
    }

    // If user doesn't exist and no clerkId provided, treat as settings update
    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  } catch (error) {
    console.error('❌ Error in POST /api/user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
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
