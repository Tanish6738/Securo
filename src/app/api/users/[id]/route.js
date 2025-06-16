import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

// GET - Get user details by ID
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    try {
      // Check if clerkClient is available
      if (!clerkClient || !clerkClient.users) {
        throw new Error("Clerk client not available");
      }

      // Get user details from Clerk
      const user = await clerkClient.users.getUser(id);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Return basic user information
      return NextResponse.json({
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || "",
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "Unknown User",
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      });
    } catch (clerkError) {
      console.error("Clerk user fetch error:", clerkError);

      // If user not found in Clerk, return basic info
      return NextResponse.json({
        id: id,
        email: `User ${id}`,
        name: "Unknown User",
        firstName: "",
        lastName: "",
        username: "",
        imageUrl: "",
        createdAt: null,
        lastActiveAt: null,
      });
    }
  } catch (error) {
    console.error("User details fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
