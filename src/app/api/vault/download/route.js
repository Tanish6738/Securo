import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User, VaultItem } from '@/lib/models'
import { decryptFile } from '@/lib/encryption'

// GET - Download and decrypt vault item
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')
    const vaultPassword = searchParams.get('password')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    if (!vaultPassword) {
      return NextResponse.json({ error: 'Vault password required' }, { status: 400 })
    }

    await connectDB()

    // Verify user's vault password
    const user = await User.findOne({ clerkId: userId })
    if (!user || !(await user.verifyVaultPassword(vaultPassword))) {
      return NextResponse.json({ error: 'Invalid vault password' }, { status: 401 })
    }

    // Find the vault item
    const vaultItem = await VaultItem.findOne({
      _id: itemId,
      userId
    })

    if (!vaultItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Decrypt the file
    const decryptedBuffer = decryptFile(vaultItem.encryptedData, vaultPassword)

    // Create response with file
    const response = new NextResponse(decryptedBuffer)
    
    // Set appropriate headers
    response.headers.set('Content-Type', vaultItem.mimeType || 'application/octet-stream')
    response.headers.set('Content-Disposition', `attachment; filename="${vaultItem.originalName}"`)
    response.headers.set('Content-Length', decryptedBuffer.length.toString())

    return response
  } catch (error) {
    console.error('Vault download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
