import { google } from "googleapis";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { oauthTokens } from "@/lib/schema";
import { decryptString, encryptString } from "@/lib/crypto";
import { eq } from "drizzle-orm";

const PROVIDER = "google";

export function createOAuthClient() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export async function loadTokens() {
  const rows = await db
    .select()
    .from(oauthTokens)
    .where(eq(oauthTokens.provider, PROVIDER));
  if (!rows.length) return null;
  const record = rows[0];
  const access = JSON.parse(
    decryptString(JSON.parse(record.accessToken))
  ) as { token: string };
  const refresh = JSON.parse(
    decryptString(JSON.parse(record.refreshToken))
  ) as { token: string };
  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    expiry: record.expiry ? record.expiry.getTime() : undefined,
  };
}

export async function saveTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiry?: number | null;
}) {
  const accessPayload = encryptString(
    JSON.stringify({ token: tokens.accessToken })
  );
  const refreshPayload = encryptString(
    JSON.stringify({ token: tokens.refreshToken })
  );
  await db
    .insert(oauthTokens)
    .values({
      provider: PROVIDER,
      accessToken: JSON.stringify(accessPayload),
      refreshToken: JSON.stringify(refreshPayload),
      expiry: tokens.expiry ? new Date(tokens.expiry) : null,
      encryptedAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: oauthTokens.provider,
      set: {
        accessToken: JSON.stringify(accessPayload),
        refreshToken: JSON.stringify(refreshPayload),
        expiry: tokens.expiry ? new Date(tokens.expiry) : null,
        encryptedAt: new Date(),
        updatedAt: new Date(),
      },
    });
}

export async function getGmailClient() {
  const auth = createOAuthClient();
  const stored = await loadTokens();
  if (!stored) {
    throw new Error("Missing OAuth tokens. Connect Gmail first.");
  }
  auth.setCredentials({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    expiry_date: stored.expiry,
  });

  auth.on("tokens", async (tokens) => {
    if (!tokens.access_token) return;
    await saveTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? stored.refreshToken,
      expiry: tokens.expiry_date ?? null,
    });
  });

  return google.gmail({ version: "v1", auth });
}

export function buildGmailQuery() {
  return {
    primary: "in:inbox category:personal",
    fm360: "label:FM360",
  };
}
