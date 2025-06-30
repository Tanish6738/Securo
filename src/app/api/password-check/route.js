import { NextResponse } from "next/server";
import keccak from "keccak";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    console.log("=== PASSWORD CHECK DEBUG ===");
    console.log("Received password:", password);
    console.log("Password type:", typeof password);

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Correct Keccak-512 hash
    const hash = keccak("keccak512").update(password).digest("hex");
    // Log hash length for debugging (should be 128 characters for keccak-512)
    console.log("Hash length:", hash.length);
    console.log("Full hash:", hash);

    const prefix = hash.substring(0, 10);
    console.log("Prefix:", prefix);

    // Try the primary API endpoint
    let response;
    try {
      response = await fetch(
        `https://passwords.xposedornot.com/v1/pass/anon/${prefix}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "PrivacyGuard-PasswordChecker/1.0"
          },
        }
      );
    } catch (fetchError) {
      console.error("Network error:", fetchError);
      return NextResponse.json(
        { error: "Network error while checking password" },
        { status: 503 }
      );
    }    if (!response.ok) {
      console.error("API response not OK:", response.status, response.statusText);
      
      // If it's a 404, the password is not found OR the service is unavailable
      if (response.status === 404) {
        try {
          const errorData = await response.json();
          if (errorData?.Error === "Not found") {
            console.log("Password not found in breach database - checking fallback list");
            
            // Load compromised passwords from JSON file
            try {
              const jsonPath = path.join(process.cwd(), 'src', 'app', 'api', 'password-check', 'Password.json');
              const passwordData = fs.readFileSync(jsonPath, 'utf8');
              const compromisedPasswords = JSON.parse(passwordData);
              
              console.log(`Loaded ${compromisedPasswords.length} compromised passwords from JSON file`);
              
              if (compromisedPasswords.includes(password.toLowerCase())) {
                console.log("Password found in compromised passwords JSON file");
                return NextResponse.json({ 
                  isCompromised: true, 
                  occurrences: 999999,
                  note: "This password is known to be commonly breached"
                });
              }
              
              return NextResponse.json({ isCompromised: false, occurrences: 0 });
              
            } catch (fileError) {
              console.error("Error reading Password.json file:", fileError);
              
              // Fallback to hardcoded list if file read fails
              const commonBreachedPasswords = [
                'password', '123456', '123456789', 'qwerty', 'abc123', 
                'password123', 'admin', 'letmein', 'welcome', 'monkey',
                'dragon', 'pass', 'master', 'hello', 'freedom',
                '1234567890', 'login', 'password1', '12345678', '1234567'
              ];
              
              if (commonBreachedPasswords.includes(password.toLowerCase())) {
                console.log("Password found in hardcoded fallback list");
                return NextResponse.json({ 
                  isCompromised: true, 
                  occurrences: 999999,
                  note: "This password is known to be commonly breached"
                });
              }
              
              return NextResponse.json({ isCompromised: false, occurrences: 0 });
            }
          }
        } catch (e) {
          console.log("404 error - service might be temporarily unavailable");
        }
          return NextResponse.json({
          isCompromised: false,
          occurrences: 0,
          note: "Breach database temporarily unavailable"
        });
      }
      
      return NextResponse.json(
        { error: "Failed to check password with breach API" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Add detailed logging to understand the API response structure
    console.log("API Response:", JSON.stringify(data, null, 2));

    // Handle the correct API response format based on documentation
    // Expected format: { "SearchPassAnon": { "anon": "808d63ba47", "char": "D:6;A:0;S:0;L:6", "count": "11999477", "wordlist": 0 } }
    if (data?.SearchPassAnon) {
      const searchResult = data.SearchPassAnon;
      
      console.log("SearchPassAnon found:", searchResult);
      
      // Check if this matches our prefix and has a count
      if (searchResult.anon === prefix && searchResult.count) {
        const occurrences = parseInt(searchResult.count) || 0;
        console.log("Password found in breach database:", occurrences, "times");
        
        return NextResponse.json({
          isCompromised: true,
          occurrences: occurrences,
          characteristics: searchResult.char || undefined
        });
      }
      // If anon doesn't match but count exists, still consider it compromised
      else if (searchResult.count && parseInt(searchResult.count) > 0) {
        const occurrences = parseInt(searchResult.count) || 0;
        console.log("Password found in breach database (alt match):", occurrences, "times");
        
        return NextResponse.json({
          isCompromised: true,
          occurrences: occurrences,
          characteristics: searchResult.char || undefined
        });
      }
    }

    // If no match found
    console.log("Password not found in breach database");
    return NextResponse.json({ 
      isCompromised: false, 
      occurrences: 0 
    });

  } catch (error) {
    console.error("Password check error:", error);
    return NextResponse.json(
      { error: "Failed to check password" },
      { status: 500 }
    );
  }
}
