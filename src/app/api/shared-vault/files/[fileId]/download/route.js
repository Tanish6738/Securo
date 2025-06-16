import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/database";
import { SharedVault, SharedVaultFile } from "@/lib/models";
import { decryptFile } from "@/lib/encryption";
import { checkVaultUnlocked, logVaultActivity } from "@/lib/vaultMiddleware";

// POST - Download file from shared vault (only when unlocked)
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;
    const body = await request.json();
    const { vaultPassword } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    if (!vaultPassword) {
      return NextResponse.json(
        { error: "Vault password required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the file
    const file = await SharedVaultFile.findById(fileId);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if vault is unlocked
    const vaultCheck = await checkVaultUnlocked(file.vaultId, userId);
    if (vaultCheck.error) {
      return NextResponse.json(
        { error: vaultCheck.error },
        { status: vaultCheck.status }
      );
    }

    const vault = vaultCheck.vault;

    try {
      // Decrypt the file
      const decryptedBuffer = decryptFile(
        file.encryptedData,
        vaultPassword,
        file.encryptionIv
      );

      // Log file download
      await logVaultActivity(
        vault._id,
        userId,
        "FILE_DOWNLOAD",
        `Downloaded file: ${file.originalName}`,
        null,
        request
      );

      // Set appropriate headers for download
      const headers = new Headers();
      headers.set("Content-Type", "application/octet-stream");
      headers.set(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );
      headers.set("Content-Length", decryptedBuffer.length.toString());
      headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

      return new NextResponse(decryptedBuffer, {
        status: 200,
        headers: headers,
      });
    } catch (decryptionError) {
      console.error("File decryption error:", decryptionError);
      return NextResponse.json(
        { error: "Invalid vault password or corrupted file" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
