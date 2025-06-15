import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import connectDB from '@/lib/database'
import { User } from '@/lib/models'

export async function POST(req) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

  let evt

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook event
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Clerk webhook received: ${eventType}`)

  try {
    await connectDB()

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData) {
  console.log('Creating new user in database:', userData.id)
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userData.id })
    
    if (existingUser) {
      console.log('User already exists in database:', userData.id)
      return
    }

    // Create new user
    const newUser = new User({
      clerkId: userData.id,
      email: userData.email_addresses?.[0]?.email_address || '',
      username: userData.username || userData.first_name || 'User',
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

    await newUser.save()
    console.log('Successfully created user in database:', userData.id)

    // Optionally, create a default monitored email entry for the user's primary email
    if (userData.email_addresses?.[0]?.email_address) {
      // You could also create a MonitoredEmail entry here if needed
      console.log('User primary email:', userData.email_addresses[0].email_address)
    }

  } catch (error) {
    console.error('Error creating user in database:', error)
    throw error
  }
}

async function handleUserUpdated(userData) {
  console.log('Updating user in database:', userData.id)
  
  try {
    const user = await User.findOne({ clerkId: userData.id })
    
    if (!user) {
      console.log('User not found in database, creating new user:', userData.id)
      await handleUserCreated(userData)
      return
    }

    // Update user information
    user.email = userData.email_addresses?.[0]?.email_address || user.email
    user.username = userData.username || userData.first_name || user.username
    user.updatedAt = new Date()

    await user.save()
    console.log('Successfully updated user in database:', userData.id)

  } catch (error) {
    console.error('Error updating user in database:', error)
    throw error
  }
}

async function handleUserDeleted(userData) {
  console.log('Deleting user from database:', userData.id)
  
  try {
    // Delete user and all associated data
    await User.deleteOne({ clerkId: userData.id })
    
    // You might also want to delete related data like:
    // - MonitoredEmails
    // - VaultItems
    // - Any other user-specific data
    
    console.log('Successfully deleted user from database:', userData.id)

  } catch (error) {
    console.error('Error deleting user from database:', error)
    throw error
  }
}
