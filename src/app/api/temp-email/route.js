import { NextResponse } from "next/server";

// DEPRECATED: This API route has been replaced by the MailService backend
// The temporary email functionality is now handled by the standalone MailService
// running on port 3001. Please update any references to use the new service.

export async function POST(request) {
  return NextResponse.json(
    {
      error: "DEPRECATED_ENDPOINT",
      message: "This API endpoint has been moved to the MailService backend.",
      newEndpoint: "POST http://localhost:3001/api/temp-email",
      documentation: "See MailService/README.md for integration details"
    },
    { status: 410 } // 410 Gone - resource no longer available
  );
}

export async function GET(request) {
  return NextResponse.json(
    {
      error: "DEPRECATED_ENDPOINT", 
      message: "This API endpoint has been moved to the MailService backend.",
      newEndpoint: "GET http://localhost:3001/api/messages/:emailId",
      documentation: "See MailService/README.md for integration details"
    },
        { status: 410 } // 410 Gone - resource no longer available
  );
}
