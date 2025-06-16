import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { SharedVault, SharedVaultFile, VaultHistory } from '@/lib/models'
import { encryptFile, decryptFile } from '@/lib/encryption'
import { checkVaultUnlocked, logVaultActivity } from '@/lib/vaultMiddleware'
import mongoose from 'mongoose'

// GET - List files in shared vault (only when unlocked)
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vaultId = searchParams.get('vaultId')

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
    }

    await connectDB()

    // Check if vault is unlocked
    const vaultCheck = await checkVaultUnlocked(vaultId, userId)
    if (vaultCheck.error) {
      return NextResponse.json({ error: vaultCheck.error }, { status: vaultCheck.status })
    }

    const vault = vaultCheck.vault    // Get files in the vault
    console.log(`DEBUG: Looking for files in vault ${vault._id}`)
    console.log(`DEBUG: Vault ID type:`, typeof vault._id, vault._id)
    
    // Try both string and ObjectId queries to debug
    const filesQuery1 = { vaultId: vault._id }
    const filesQuery2 = { vaultId: vault._id.toString() }
    const filesQuery3 = { vaultId: new mongoose.Types.ObjectId(vault._id) }
    
    console.log('DEBUG: Trying query 1 (vault._id):', filesQuery1)
    const files1 = await SharedVaultFile.find(filesQuery1).select('-encryptedData -encryptionIv')
    console.log(`DEBUG: Query 1 result: ${files1.length} files`)
    
    console.log('DEBUG: Trying query 2 (vault._id.toString()):', filesQuery2)
    const files2 = await SharedVaultFile.find(filesQuery2).select('-encryptedData -encryptionIv')
    console.log(`DEBUG: Query 2 result: ${files2.length} files`)
    
    console.log('DEBUG: Trying query 3 (new ObjectId):', filesQuery3)
    const files3 = await SharedVaultFile.find(filesQuery3).select('-encryptedData -encryptionIv')
    console.log(`DEBUG: Query 3 result: ${files3.length} files`)
    
    // Also check all files and their vaultIds
    const allFiles = await SharedVaultFile.find({}).select('vaultId originalName')
    console.log('DEBUG: All files in database:')
    allFiles.forEach(file => {
      console.log(`  File: ${file.originalName}, vaultId: ${file.vaultId} (type: ${typeof file.vaultId})`)
      console.log(`  Matches vault._id? ${file.vaultId.equals ? file.vaultId.equals(vault._id) : file.vaultId === vault._id}`)
    })
    
    const files = files1.length > 0 ? files1 : (files2.length > 0 ? files2 : files3)
    files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    console.log(`DEBUG: Using files result with ${files.length} files`)
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.originalName} (${file.fileName})`)
      console.log(`     MIME: ${file.mimeType}`)
      console.log(`     Size: ${file.fileSize} bytes`)
      console.log(`     Created: ${file.createdAt}`)
      console.log(`     File ID: ${file._id}`)
    })

    // Log file access
    await logVaultActivity(
      vault._id, 
      userId, 
      'FILE_VIEW', 
      `Viewed vault file list (${files.length} files)`,
      null,
      request
    )

    return NextResponse.json({
      files,
      count: files.length,
      vault: {
        id: vault._id,
        name: vault.name,
        remainingUnlockTime: vault.getRemainingUnlockTime()
      }
    })
  } catch (error) {
    console.error('Shared Vault Files GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve vault files' },
      { status: 500 }
    )
  }
}

// POST - Upload file to shared vault (only when unlocked)
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const vaultId = formData.get('vaultId')
    const vaultPassword = formData.get('vaultPassword')
    const description = formData.get('description') || ''
    const tags = formData.get('tags') ? formData.get('tags').split(',') : []

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID is required' }, { status: 400 })
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

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Encrypt the file using the vault password
    const { encryptedData, iv } = encryptFile(buffer, vaultPassword)

    // Save to database
    const vaultFile = new SharedVaultFile({
      vaultId: vault._id,
      uploadedBy: userId,
      fileName: `${Date.now()}_${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      fileSize: buffer.length,
      encryptedData,
      encryptionIv: iv,
      description,
      tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
    })

    await vaultFile.save()

    // Log file upload
    await logVaultActivity(
      vault._id,
      userId,
      'FILE_UPLOAD',
      `Uploaded file "${file.name}" (${buffer.length} bytes)`,
      vaultFile._id,
      request
    )

    // Return file without encrypted data
    const { encryptedData: _, encryptionIv: __, ...fileResponse } = vaultFile.toObject()

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: fileResponse
    })
  } catch (error) {
    console.error('Shared Vault File POST error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// DELETE - Delete file from shared vault (only when unlocked)
export async function DELETE(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const vaultId = searchParams.get('vaultId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    if (!vaultId) {
      return NextResponse.json({ error: 'Vault ID required' }, { status: 400 })
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

    // Check if user can delete (admin or uploader)
    const isAdmin = vault.adminId === userId
    const isUploader = vaultFile.uploadedBy === userId

    if (!isAdmin && !isUploader) {
      return NextResponse.json({ error: 'Not authorized to delete this file' }, { status: 403 })
    }

    // Delete the file
    await SharedVaultFile.deleteOne({ _id: fileId })

    // Log file deletion
    await logVaultActivity(
      vault._id,
      userId,
      'FILE_DELETE',
      `Deleted file "${vaultFile.originalName}"`,
      vaultFile._id,
      request
    )

    return NextResponse.json({
      message: 'File deleted successfully',
      deletedFile: {
        id: vaultFile._id,
        fileName: vaultFile.fileName,
        originalName: vaultFile.originalName
      }
    })
  } catch (error) {
    console.error('Shared Vault File DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
