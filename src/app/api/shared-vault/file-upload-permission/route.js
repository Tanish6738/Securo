import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/database";
import { SharedVault, VaultHistory } from "@/lib/models";
import { sendToUser } from "@/app/api/notifications/ws/route";

// POST - Handle file upload permission requests and responses
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      vaultId,
      type,
      uploadRequestId,
      approved,
      reason,
      reviewerId,
      fileName,
      fileSize,
      fileType,
    } = body;

    if (!vaultId) {
      return NextResponse.json(
        { error: "Vault ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the vault
    const vault = await SharedVault.findOne({
      _id: vaultId,
      memberIds: { $in: [userId] },
      isActive: true,
    });

    if (!vault) {
      return NextResponse.json(
        { error: "Vault not found or not authorized" },
        { status: 404 }
      );
    }
    if (type === "request") {
      // User is requesting permission to upload a file
      if (!fileName) {
        return NextResponse.json(
          { error: "File name is required" },
          { status: 400 }
        );
      }

      // Create upload request ID
      const requestId = `upload_${vaultId}_${userId}_${Date.now()}`;

      // Log the upload request
      try {
        const historyEntry = new VaultHistory({
          vaultId: vault._id,
          userId,
          action: "FILE_UPLOAD",
          details: `Requested permission to upload "${fileName}" (${fileSize} bytes)`,
          timestamp: new Date(),
        });
        await historyEntry.save();
      } catch (historyError) {
        console.error("Error saving history:", historyError);
        // Continue anyway, don't fail the request for history logging
      } // Get user details from Clerk
      let uploaderName = "Team Member";
      try {
        const user = await clerkClient.users.getUser(userId);
        uploaderName =
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          user.emailAddresses?.[0]?.emailAddress ||
          "Team Member";
      } catch (error) {
        console.error("Error fetching user details:", error);
      }

      // Send permission request to admin and other members
      const requestData = {
        vaultId: vault._id,
        vaultName: vault.name,
        requestId,
        uploaderId: userId,
        uploaderName,
        fileName,
        fileSize,
        fileType,
        reason: reason || "No reason provided",
        requestedAt: new Date().toISOString(),
      };
      try {
        // Send to admin first - admin is the primary approver
        if (vault.adminId !== userId) {
          sendToUser(vault.adminId, "file_upload_request", {
            ...requestData,
            isAdmin: true,
            priority: "high",
          });
        }

        // Optionally send to other members for awareness (lower priority)
        // Admin approval should be sufficient, but other members can also approve if needed
        vault.memberIds
          .filter(
            (memberId) => memberId !== userId && memberId !== vault.adminId
          )
          .forEach((memberId) => {
            sendToUser(memberId, "file_upload_request", {
              ...requestData,
              isAdmin: false,
              priority: "normal",
            });
          });
      } catch (notificationError) {
        console.error(
          "Error sending upload request notifications:",
          notificationError
        );
        // Continue anyway, don't fail the request for notification issues
      }
      return NextResponse.json({
        success: true,
        requestId,
        message: "Upload permission request sent to team members",
      });
    } else if (type === "response") {
      // User is responding to an upload permission request
      if (!uploadRequestId || approved === undefined || !reviewerId) {
        return NextResponse.json(
          {
            error:
              "Upload request ID, approval status, and reviewer ID are required",
          },
          { status: 400 }
        );
      } // Log the permission response
      const historyEntry = new VaultHistory({
        vaultId: vault._id,
        userId: reviewerId,
        action: approved ? "FILE_UPLOAD" : "FILE_DELETE",
        details: `${approved ? "Approved" : "Denied"} upload request ${uploadRequestId}${reason ? `: ${reason}` : ""}`,
        timestamp: new Date(),
      });
      await historyEntry.save();

      // Send response notification to the requester
      // Extract requester ID from upload request ID
      const uploaderIdMatch = uploadRequestId.match(/upload_[^_]+_([^_]+)_\d+/);
      const uploaderId = uploaderIdMatch ? uploaderIdMatch[1] : null;

      if (uploaderId) {
        try {
          sendToUser(
            uploaderId,
            approved ? "upload_approved" : "upload_denied",
            {
              vaultId: vault._id,
              vaultName: vault.name,
              uploadRequestId,
              approved,
              reason,
              reviewerName: "Team Member", // You might want to get this from Clerk
            }
          );
        } catch (notificationError) {
          console.error(
            "Error sending upload response notifications:",
            notificationError
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: `Upload ${approved ? "approved" : "denied"} successfully`,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("File upload permission error:", error);
    return NextResponse.json(
      {
        error: `Failed to process file upload permission request: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
