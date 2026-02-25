import { NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/gmail";

export async function GET() {
  const auth = createOAuthClient();
  const scopes = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  const url = auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  return NextResponse.redirect(url);
}
