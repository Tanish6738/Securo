import { NextResponse } from 'next/server';

const KAI_API_BASE = process.env.KAI_API_KEY || "https://kai-api-v0.onrender.com/";

// Helper function to scan repository
async function scanRepository(repoUrl) {
  try {
    // Validate GitHub URL
    if (!repoUrl || !repoUrl.includes('github.com')) {
      throw new Error('Invalid GitHub repository URL');
    }

    // Make request to Kai API
    const response = await fetch(`${KAI_API_BASE}scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: repoUrl
      })
    });

    if (!response.ok) {
      throw new Error(`Kai API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error scanning repository:', error);
    throw error;
  }
}

// Helper function to extract username and repo from GitHub URL
function parseGitHubUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part);
    
    if (pathParts.length >= 2) {
      return {
        username: pathParts[0],
        repo: pathParts[1].replace('.git', '')
      };
    }
    throw new Error('Invalid GitHub URL format');
  } catch (error) {
    throw new Error('Unable to parse GitHub URL');
  }
}

// GET method - scan using URL parameters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const repo = searchParams.get('repo');
    const repoUrl = searchParams.get('repoUrl');

    let targetUrl;

    if (repoUrl) {
      targetUrl = repoUrl;
    } else if (username && repo) {
      targetUrl = `https://github.com/${username}/${repo}.git`;
    } else {
      return NextResponse.json(
        { 
          error: 'Missing required parameters. Provide either repoUrl or both username and repo parameters.',
          example: '/api/api-key-scanner?username=octocat&repo=Hello-World'
        },
        { status: 400 }
      );
    }

    const result = await scanRepository(targetUrl);

    return NextResponse.json({
      success: true,
      method: 'GET',
      scanned_repository: targetUrl,
      ...result
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        method: 'GET'
      },
      { status: 500 }
    );
  }
}

// POST method - scan using JSON payload
export async function POST(request) {
  try {
    const body = await request.json();
    const { repo, repoUrl, username, repoName } = body;

    let targetUrl;

    if (repo) {
      targetUrl = repo;
    } else if (repoUrl) {
      targetUrl = repoUrl;
    } else if (username && repoName) {
      targetUrl = `https://github.com/${username}/${repoName}.git`;
    } else {
      return NextResponse.json(
        { 
          error: 'Missing required parameters. Provide repo URL in the request body.',
          example: { repo: 'https://github.com/username/repository.git' }
        },
        { status: 400 }
      );
    }

    const result = await scanRepository(targetUrl);

    return NextResponse.json({
      success: true,
      method: 'POST',
      scanned_repository: targetUrl,
      ...result
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        method: 'POST'
      },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
