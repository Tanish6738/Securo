import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User, VaultItem } from '@/lib/models'
import { decryptFile } from '@/lib/encryption'

// GET - Preview vault item (returns file content for inline display)
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

    // For text files, return as text for preview
    if (vaultItem.mimeType?.startsWith('text/') || 
        vaultItem.mimeType === 'application/json' ||
        vaultItem.mimeType === 'application/xml') {
      
      const textContent = decryptedBuffer.toString('utf-8')
      // Limit preview to first 5000 characters
      const previewText = textContent.length > 5000 
        ? textContent.substring(0, 5000) + '...\n\n[Content truncated - download to see full file]'
        : textContent
      
      return NextResponse.json({
        type: 'text',
        content: previewText,
        originalName: vaultItem.originalName,
        mimeType: vaultItem.mimeType,
        fileSize: vaultItem.fileSize
      })
    }

    // For images, videos, audio, and PDFs, return the file with inline disposition
    const response = new NextResponse(decryptedBuffer)
    response.headers.set('Content-Type', vaultItem.mimeType || 'application/octet-stream')
    response.headers.set('Content-Disposition', `inline; filename="${vaultItem.originalName}"`)
    response.headers.set('Content-Length', decryptedBuffer.length.toString())
    
    // Add CORS headers for preview
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')

    return response
  } catch (error) {
    console.error('Vault preview error:', error)
    return NextResponse.json(
      { error: 'Failed to preview file' },
      { status: 500 }
    )
  }
}
