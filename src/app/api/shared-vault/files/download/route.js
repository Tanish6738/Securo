import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, SharedVaultFile, VaultHistory } from '@/lib/models'
import { decryptFile } from '@/lib/encryption'
import { checkVaultUnlocked, logVaultActivity } from '@/lib/vaultMiddleware'

// GET - Download file from shared vault (only when unlocked)
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

    // Log file download
    await logVaultActivity(
      vault._id,
      userId,
      'FILE_DOWNLOAD',
      `Downloaded file "${vaultFile.originalName}"`,
      vaultFile._id,
      request
    )

    // Create response with file
    const response = new NextResponse(decryptedBuffer)
    
    // Set appropriate headers
    response.headers.set('Content-Type', vaultFile.mimeType || 'application/octet-stream')
    response.headers.set('Content-Disposition', `attachment; filename="${vaultFile.originalName}"`)
    response.headers.set('Content-Length', decryptedBuffer.length.toString())

    return response
  } catch (error) {
    console.error('Shared Vault File download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
