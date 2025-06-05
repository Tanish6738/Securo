import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/database'
import { User, VaultItem } from '@/lib/models'
import { encryptFile, decryptFile } from '@/lib/encryption'

// GET - Retrieve all vault items for user
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const vaultItems = await VaultItem.find({ userId })
      .select('-encryptedData -encryptionIv') // Don't send encrypted data in list
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      items: vaultItems,
      count: vaultItems.length
    })
  } catch (error) {
    console.error('Vault GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve vault items' },
      { status: 500 }
    )
  }
}

// POST - Upload and encrypt file to vault
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const vaultPassword = formData.get('vaultPassword')
    const description = formData.get('description') || ''
    const tags = formData.get('tags') ? formData.get('tags').split(',') : []

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!vaultPassword) {
      return NextResponse.json({ error: 'Vault password required' }, { status: 400 })
    }

    await connectDB()

    // Verify user's vault password
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.vaultPassword && !(await user.verifyVaultPassword(vaultPassword))) {
      return NextResponse.json({ error: 'Invalid vault password' }, { status: 401 })
    }

    // If no vault password set, set it
    if (!user.vaultPassword) {
      user.vaultPassword = vaultPassword
      await user.save()
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Encrypt the file
    const { encryptedData, iv } = encryptFile(buffer, vaultPassword)

    // Save to database
    const vaultItem = new VaultItem({
      userId,
      fileName: `${Date.now()}_${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      fileSize: buffer.length,
      encryptedData,
      encryptionIv: iv,
      description,
      tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
    })

    await vaultItem.save()

    // Return item without encrypted data
    const { encryptedData: _, encryptionIv: __, ...itemResponse } = vaultItem.toObject()

    return NextResponse.json({
      message: 'File uploaded and encrypted successfully',
      item: itemResponse
    })
  } catch (error) {
    console.error('Vault POST error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// DELETE - Delete vault item
export async function DELETE(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    await connectDB()

    const deletedItem = await VaultItem.findOneAndDelete({
      _id: itemId,
      userId
    })

    if (!deletedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Item deleted successfully',
      deletedItem: {
        id: deletedItem._id,
        fileName: deletedItem.fileName,
        originalName: deletedItem.originalName
      }
    })
  } catch (error) {
    console.error('Vault DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
