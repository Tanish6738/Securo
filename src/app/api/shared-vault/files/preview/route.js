import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, SharedVaultFile, VaultHistory } from '@/lib/models'
import { decryptFile } from '@/lib/encryption'
import { checkVaultUnlocked, logVaultActivity } from '@/lib/vaultMiddleware'

// GET - Preview file from shared vault (only when unlocked)
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const vaultId = searchParams.get('vaultId')
    const vaultPassword = searchParams.get('password')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID required' }, { status: 400 })
    }

    if (!vaultPassword) {
      return NextResponse.json({ error: 'Vault password required' }, { status: 400 })
    }

    await connectDB()

    // Check if vault is unlocked
    const vaultCheck = await checkVaultUnlocked(vaultId, userId)
    if (vaultCheck.error) {
      return NextResponse.json({ error: vaultCheck.error }, { status: vaultCheck.status })
    }

    const vault = vaultCheck.vault

    // Find the file
    const vaultFile = await SharedVaultFile.findOne({
      _id: fileId,
      vaultId: vault._id
    })

    if (!vaultFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Decrypt the file
    const decryptedBuffer = decryptFile(vaultFile.encryptedData, vaultPassword)

    // Log file preview
    await logVaultActivity(
      vault._id,
      userId,
      'FILE_VIEW',
      `Previewed file "${vaultFile.originalName}"`,
      vaultFile._id,
      request
    )

    // For text files, return as text for preview
    if (vaultFile.mimeType?.startsWith('text/') || 
        vaultFile.mimeType === 'application/json' ||
        vaultFile.mimeType === 'application/xml') {
      
      const textContent = decryptedBuffer.toString('utf-8')
      // Limit preview to first 5000 characters
      const previewText = textContent.length > 5000 
        ? textContent.substring(0, 5000) + '...\n\n[Content truncated - download to see full file]'
        : textContent
      
      return NextResponse.json({
        type: 'text',
        content: previewText,
        originalName: vaultFile.originalName,
        mimeType: vaultFile.mimeType,
        fileSize: vaultFile.fileSize
      })
    }

    // For images, videos, audio, and PDFs, return the file with inline disposition
    const response = new NextResponse(decryptedBuffer)
    response.headers.set('Content-Type', vaultFile.mimeType || 'application/octet-stream')
    response.headers.set('Content-Disposition', `inline; filename="${vaultFile.originalName}"`)
    response.headers.set('Content-Length', decryptedBuffer.length.toString())
    
    // Add CORS headers for preview
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')

    return response
  } catch (error) {
    console.error('Shared Vault File preview error:', error)
    return NextResponse.json(
      { error: 'Failed to preview file' },
      { status: 500 }
    )
  }
}
