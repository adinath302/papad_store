import { NextResponse } from "next/server";

// Google OAuth scaffold
// To fully implement:
// 1. Create a Google Cloud Console project
// 2. Enable Google OAuth 2.0 API
// 3. Add credentials (OAuth client ID & secret) to .env:
//    GOOGLE_CLIENT_ID=xxx
//    GOOGLE_CLIENT_SECRET=xxx
//    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
// 4. Create an app/api/auth/google/callback/route.ts for the redirect

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env",
        hint: "See app/api/auth/google/route.ts for setup instructions",
      },
      { status: 501 },
    );
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/google/callback";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
