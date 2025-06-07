import { NextResponse } from "next/server";
import { API_BASE } from "../../../config/api.js";

export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE}/api/temp-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Temp email API error:', error);
    return NextResponse.json(
      { error: 'Failed to process temp email request' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Forward query parameters to the mail service
    const queryString = searchParams.toString();
    const endpoint = queryString ? `${API_BASE}/api/messages?${queryString}` : `${API_BASE}/api/messages`;
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Get messages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
