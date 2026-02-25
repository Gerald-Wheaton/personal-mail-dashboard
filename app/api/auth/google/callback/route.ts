import { NextResponse } from "next/server";
import { createOAuthClient, saveTokens } from "@/lib/gmail";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  const auth = createOAuthClient();
  const { tokens } = await auth.getToken(code);
  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }
  await saveTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiry: tokens.expiry_date ?? null,
  });
  return NextResponse.redirect(new URL("/", request.url));
}
