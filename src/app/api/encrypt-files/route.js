import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { FileMetadata } from '@/lib/models';

// Store file metadata (NOT the actual file)
export async function POST(request) {
  try {
    const { 
      fileName, 
      fileType, 
      fileSize, 
      salt, 
      iv, 
      keyHash, 
      localFileId,
      userId,
      tags = [],
      description = ''
    } = await request.json();

    // Validate required fields
    if (!fileName || !fileType || !fileSize || !salt || !iv || !keyHash || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await clientPromise;

    // Create metadata entry
    const metadata = new FileMetadata({
      userId,
      fileName,
      fileType,
      fileSize,
      salt,
      iv,
      keyHash,
      localFileId,
      tags,
      description
    });

    // Save to database
    await metadata.save();

    return NextResponse.json({ 
      success: true, 
      metadataId: metadata._id,
      message: 'File metadata stored successfully'
    });

  } catch (error) {
    console.error('Error storing file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to store file metadata' }, 
      { status: 500 }
    );
  }
}

// Get file metadata for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const metadataId = searchParams.get('metadataId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await clientPromise;

    let result;
    
    if (metadataId) {
      // Get specific file metadata
      result = await FileMetadata.findOne({ 
        _id: metadataId, 
        userId 
      });
      
      if (!result) {
        return NextResponse.json(
          { error: 'File metadata not found' }, 
          { status: 404 }
        );
      }
    } else {
      // Get all file metadata for user
      result = await FileMetadata.find({ userId })
        .sort({ createdAt: -1 })
        .select('-__v');
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('Error retrieving file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file metadata' }, 
      { status: 500 }
    );
  }
}

// Update file metadata
export async function PATCH(request) {
  try {
    const { 
      metadataId, 
      userId,
      tags,
      description,
      lastAccessed,
      isExported
    } = await request.json();

    if (!metadataId || !userId) {
      return NextResponse.json(
        { error: 'Metadata ID and User ID are required' }, 
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await clientPromise;

    // Prepare update object
    const updateData = { updatedAt: new Date() };
    if (tags !== undefined) updateData.tags = tags;
    if (description !== undefined) updateData.description = description;
    if (lastAccessed !== undefined) updateData.lastAccessed = new Date(lastAccessed);
    if (isExported !== undefined) updateData.isExported = isExported;

    // Update metadata
    const result = await FileMetadata.findOneAndUpdate(
      { _id: metadataId, userId },
      updateData,
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'File metadata not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'File metadata updated successfully'
    });

  } catch (error) {
    console.error('Error updating file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update file metadata' }, 
      { status: 500 }
    );
  }
}

// Delete file metadata
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const metadataId = searchParams.get('metadataId');
    const userId = searchParams.get('userId');

    if (!metadataId || !userId) {
      return NextResponse.json(
        { error: 'Metadata ID and User ID are required' }, 
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await clientPromise;

    // Delete metadata
    const result = await FileMetadata.findOneAndDelete({ 
      _id: metadataId, 
      userId 
    });

    if (!result) {
      return NextResponse.json(
        { error: 'File metadata not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'File metadata deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file metadata:', error);
    return NextResponse.json(
      { error: 'Failed to delete file metadata' }, 
      { status: 500 }
    );
  }
}