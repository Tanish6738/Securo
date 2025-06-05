import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { MonitoredEmail } from '@/lib/models'

// GET - Get monitored emails for user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const monitoredEmails = await MonitoredEmail.find({ userId })
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      emails: monitoredEmails,
      count: monitoredEmails.length
    })
  } catch (error) {
    console.error('Monitored emails GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve monitored emails' },
      { status: 500 }
    )
  }
}

// POST - Add new monitored email
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, isPrimary = false } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    await connectDB()

    // Check if email already exists for this user
    const existingEmail = await MonitoredEmail.findOne({ userId, email })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already being monitored' }, { status: 409 })
    }

    // If setting as primary, remove primary flag from other emails
    if (isPrimary) {
      await MonitoredEmail.updateMany(
        { userId },
        { $set: { isPrimary: false } }
      )
    }

    const monitoredEmail = new MonitoredEmail({
      userId,
      email,
      isPrimary
    })

    await monitoredEmail.save()

    return NextResponse.json({
      message: 'Email added to monitoring',
      email: monitoredEmail
    })
  } catch (error) {
    console.error('Monitored emails POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add monitored email' },
      { status: 500 }
    )
  }
}

// DELETE - Remove monitored email
export async function DELETE(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const emailId = searchParams.get('id')

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID required' }, { status: 400 })
    }

    await connectDB()

    const deletedEmail = await MonitoredEmail.findOneAndDelete({
      _id: emailId,
      userId
    })

    if (!deletedEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Email removed from monitoring',
      deletedEmail: {
        id: deletedEmail._id,
        email: deletedEmail.email
      }
    })
  } catch (error) {
    console.error('Monitored emails DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to remove monitored email' },
      { status: 500 }
    )
  }
}

// PUT - Update monitored email (e.g., breach information)
export async function PUT(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emailId, breaches, breachCount, lastChecked } = await request.json()

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID required' }, { status: 400 })
    }

    await connectDB()

    const updateData = {}
    if (breaches !== undefined) updateData.breaches = breaches
    if (breachCount !== undefined) updateData.breachCount = breachCount
    if (lastChecked !== undefined) updateData.lastChecked = lastChecked

    const updatedEmail = await MonitoredEmail.findOneAndUpdate(
      { _id: emailId, userId },
      { $set: updateData },
      { new: true }
    )

    if (!updatedEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Email updated successfully',
      email: updatedEmail
    })
  } catch (error) {
    console.error('Monitored emails PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update monitored email' },
      { status: 500 }
    )
  }
}
