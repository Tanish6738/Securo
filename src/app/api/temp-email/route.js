import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { customName } = await request.json();

    // Set default API base if environment variable is not set
    const API_BASE = process.env.MAILTM_API_BASE || "https://api.mail.tm";

    console.log("🚀 Starting temp email creation...");
    console.log("📍 Environment:", process.env.NODE_ENV);
    console.log("🌍 Vercel Region:", process.env.VERCEL_REGION || "unknown");
    console.log("🔗 Using API Base:", API_BASE);
    console.log("👤 Custom Name:", customName || "none");

    // Enhanced fetch with timeout and better error handling
    const fetchWithTimeout = async (url, options, timeout = 15000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            "User-Agent": "PrivacyGuard/1.0",
          },
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
    };

    // First, get a domain for temporary email
    console.log("🔍 Fetching available domains...");
    const domainResponse = await fetchWithTimeout(`${API_BASE}/domains`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!domainResponse.ok) {
      console.error(
        "❌ Domain fetch failed:",
        domainResponse.status,
        domainResponse.statusText
      );
      console.error("🌐 Request URL:", `${API_BASE}/domains`);
      console.error(
        "📡 Response headers:",
        Object.fromEntries(domainResponse.headers.entries())
      );

      const errorBody = await domainResponse.text();
      console.error("📄 Domain fetch error body:", errorBody);

      // Check for specific error types
      if (domainResponse.status === 403) {
        throw new Error(
          "Access forbidden - API may be blocking requests from this IP range"
        );
      } else if (domainResponse.status === 429) {
        throw new Error(
          "Rate limit exceeded - too many requests to mail.tm API"
        );
      } else if (domainResponse.status >= 500) {
        throw new Error(
          "Mail.tm server error - service may be temporarily unavailable"
        );
      }

      throw new Error(
        `Failed to fetch domains: ${domainResponse.status} ${domainResponse.statusText}`
      );
    }

    const domains = await domainResponse.json();
    console.log(
      "✅ Domains fetched successfully:",
      domains["hydra:member"]?.length || 0,
      "domains available"
    );

    const domain = domains["hydra:member"][0]?.domain;
    if (!domain) {
      console.error("❌ No available domains found");
      console.error("📄 Domains response:", JSON.stringify(domains, null, 2));
      throw new Error("No available domains from mail.tm");
    }

    console.log("🏷️ Selected domain:", domain);

    // Function to generate a unique email address
    const generateUniqueEmail = (baseName, attempt = 0) => {
      let username;
      if (baseName) {
        // If custom name provided, add timestamp and attempt number for uniqueness
        const timestamp = Date.now().toString().slice(-6);
        const suffix = attempt > 0 ? `_${attempt}` : "";
        username = `${baseName}${timestamp}${suffix}`;
      } else {
        // Generate random username with timestamp for uniqueness
        const randomStr = Math.random().toString(36).substring(2, 10);
        const timestamp = Date.now().toString().slice(-4);
        username = `${randomStr}${timestamp}`;
      }
      return `${username}@${domain}`;
    };

    // Try to create account with retries for unique email
    let account = null;
    let email = null;
    let password = Math.random().toString(36).substring(2, 15);
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      email = generateUniqueEmail(customName, attempt);

      console.log(
        `Attempt ${attempt + 1}: Trying to create account with email: ${email}`
      );

      const accountResponse = await fetch(`${API_BASE}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: email,
          password: password,
        }),
      });

      if (accountResponse.ok) {
        account = await accountResponse.json();
        console.log(`Successfully created account: ${email}`);
        break;
      } else if (accountResponse.status === 422) {
        // Email already exists, try again with different name
        const errorData = await accountResponse.text();
        console.log(`Email ${email} already exists, trying again...`);
        continue;
      } else {
        // Other error, log and throw
        const errorData = await accountResponse.text();
        console.error("Account creation failed with error:", errorData);
        console.error("Response status:", accountResponse.status);
        throw new Error(
          `Failed to create account: ${accountResponse.status} ${accountResponse.statusText}`
        );
      }
    }

    if (!account) {
      throw new Error("Failed to create unique email after multiple attempts");
    }

    // Get authentication token
    const authResponse = await fetch(`${API_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: email,
        password: password,
      }),
    });

    let token = null;
    if (authResponse.ok) {
      const authData = await authResponse.json();
      token = authData.token;
    } else {
      console.warn("Failed to get auth token, using account ID as fallback");
    }

    return NextResponse.json({
      address: account.address || email,
      token: token || account.id,
      id: account.id,
      createdAt: account.createdAt || new Date().toISOString(),
      domain: domain,
      password: password, // Store for future authentication
    });
  } catch (error) {
    console.error("Temp email generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate temporary email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Set default API base if environment variable is not set
    const API_BASE = process.env.MAILTM_API_BASE || "https://api.mail.tm";

    // Fetch messages using authentication token
    const response = await fetch(`${API_BASE}/messages?page=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If token is invalid or expired, return empty result
      if (response.status === 401) {
        return NextResponse.json({
          messages: [],
          totalItems: 0,
          error: "Authentication failed - token may be expired",
        });
      }
      console.error(
        "Messages fetch failed:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch messages: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json({
      messages: data["hydra:member"] || [],
      totalItems: data["hydra:totalItems"] || 0,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
