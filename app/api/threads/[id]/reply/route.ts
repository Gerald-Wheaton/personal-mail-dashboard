import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { getGmailClient } from "@/lib/gmail";

function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function formatReplyBody(body: string) {
  return `${body}\n\n--\nSent from my dashboard`;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await request.json();
    const body = String(payload?.body ?? "").trim();
    const mode = String(payload?.mode ?? "reply");

    if (!body) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }

    const lastMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, params.id))
      .orderBy(desc(messages.date))
      .limit(1);

    if (!lastMessage.length) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const message = lastMessage[0];
    const gmail = await getGmailClient();
    const profile = await gmail.users.getProfile({ userId: "me" });
    const userEmail = profile.data.emailAddress ?? "me";

    const subject = message.subject?.toLowerCase().startsWith("re:")
      ? message.subject
      : `Re: ${message.subject ?? ""}`;

    const to = message.fromEmail ? [message.fromEmail] : [];
    const cc = mode === "reply-all" ? message.cc ?? [] : [];

    const headers = [
      `From: ${userEmail}`,
      `To: ${to.join(", ")}`,
      cc.length ? `Cc: ${cc.join(", ")}` : null,
      `Subject: ${subject}`,
      message.rfcMessageId ? `In-Reply-To: ${message.rfcMessageId}` : null,
      message.references
        ? `References: ${message.references} ${message.rfcMessageId ?? ""}`
        : message.rfcMessageId
        ? `References: ${message.rfcMessageId}`
        : null,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
    ].filter(Boolean);

    const raw = `${headers.join("\r\n")}\r\n\r\n${formatReplyBody(body)}`;

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeBase64Url(raw),
        threadId: params.id,
      },
    });

    return NextResponse.json({ status: "sent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
