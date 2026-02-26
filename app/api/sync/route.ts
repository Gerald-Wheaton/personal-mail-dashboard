import { NextResponse } from "next/server";
import { getGmailClient, buildGmailQuery } from "@/lib/gmail";
import { db } from "@/lib/db";
import { messages, threads } from "@/lib/schema";
import { parseMessage } from "@/lib/gmail-parsers";

function normalizeSyncError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const fallback = {
    status: 500,
    code: "SYNC_UNKNOWN_ERROR",
    message: "Unknown sync error",
  };

  if (!(error instanceof Error)) return fallback;

  if (error.message.includes("Missing OAuth tokens")) {
    return {
      status: 401,
      code: "GMAIL_NOT_CONNECTED",
      message: "Missing OAuth tokens. Connect Gmail first.",
    };
  }

  const maybeResponse = (error as Error & { response?: unknown }).response;
  const responseData =
    maybeResponse && typeof maybeResponse === "object"
      ? (maybeResponse as { data?: unknown }).data
      : undefined;
  const googleError =
    responseData && typeof responseData === "object"
      ? (responseData as { error?: unknown }).error
      : undefined;
  const googleStatus =
    googleError && typeof googleError === "object"
      ? (googleError as { status?: unknown }).status
      : undefined;
  const googleMessage =
    googleError && typeof googleError === "object"
      ? (googleError as { message?: unknown }).message
      : undefined;

  if (
    googleStatus === "PERMISSION_DENIED" &&
    typeof googleMessage === "string" &&
    googleMessage.includes("Gmail API has not been used")
  ) {
    return {
      status: 503,
      code: "GMAIL_API_DISABLED",
      message:
        "Gmail API is disabled for the configured Google Cloud project. Enable gmail.googleapis.com and retry in a few minutes.",
    };
  }

  return {
    status: 500,
    code: "SYNC_FAILED",
    message: error.message || fallback.message,
  };
}

export async function POST() {
  try {
    const gmail = await getGmailClient();
    const queries = buildGmailQuery();

    const [primary, fm360] = await Promise.all([
      gmail.users.threads.list({
        userId: "me",
        q: queries.primary,
        maxResults: 50,
      }),
      gmail.users.threads.list({
        userId: "me",
        q: queries.fm360,
        maxResults: 50,
      }),
    ]);

    const threadIds = new Set<string>();
    for (const thread of primary.data.threads ?? []) {
      if (thread.id) threadIds.add(thread.id);
    }
    for (const thread of fm360.data.threads ?? []) {
      if (thread.id) threadIds.add(thread.id);
    }

    const results = [] as string[];

    for (const threadId of threadIds) {
      const thread = await gmail.users.threads.get({
        userId: "me",
        id: threadId,
        format: "full",
      });

      const parsedMessages = (thread.data.messages ?? []).map(parseMessage);
      const unreadCount = parsedMessages.filter((msg) => msg.isUnread).length;
      const lastMessage = parsedMessages
        .filter((msg) => msg.date)
        .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))
        .at(-1);

      const subject = lastMessage?.subject || parsedMessages[0]?.subject || "(no subject)";
      const labels = Array.from(
        new Set(parsedMessages.flatMap((msg) => msg.labels))
      );
      const snippet = lastMessage?.snippet || parsedMessages[0]?.snippet || "";
      const lastFromName = lastMessage?.fromName ?? null;
      const lastFromEmail = lastMessage?.fromEmail ?? null;

      await db
        .insert(threads)
        .values({
          id: threadId,
          subject,
          snippet,
          lastFromName,
          lastFromEmail,
          lastMessageAt: lastMessage?.date ?? null,
          unreadCount,
          labels,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: threads.id,
          set: {
            subject,
            snippet,
            lastFromName,
            lastFromEmail,
            lastMessageAt: lastMessage?.date ?? null,
            unreadCount,
            labels,
            updatedAt: new Date(),
          },
        });

      for (const message of parsedMessages) {
        if (!message.id) continue;
        await db
          .insert(messages)
          .values({
            id: message.id,
            threadId: message.threadId,
            fromEmail: message.fromEmail,
            fromName: message.fromName,
            to: message.to,
            cc: message.cc,
            bcc: message.bcc,
            subject: message.subject,
            date: message.date ?? null,
            bodyText: message.bodyText,
            bodyHtml: message.bodyHtml,
            isUnread: message.isUnread,
            labels: message.labels,
            rfcMessageId: message.rfcMessageId,
            references: message.references,
            inReplyTo: message.inReplyTo,
          })
          .onConflictDoUpdate({
            target: messages.id,
            set: {
              threadId: message.threadId,
              fromEmail: message.fromEmail,
              fromName: message.fromName,
              to: message.to,
              cc: message.cc,
              bcc: message.bcc,
              subject: message.subject,
              date: message.date ?? null,
              bodyText: message.bodyText,
              bodyHtml: message.bodyHtml,
              isUnread: message.isUnread,
              labels: message.labels,
              rfcMessageId: message.rfcMessageId,
              references: message.references,
              inReplyTo: message.inReplyTo,
            },
          });
      }

      results.push(threadId);
    }

    return NextResponse.json({ synced: results.length, threadIds: results });
  } catch (error) {
    const normalized = normalizeSyncError(error);
    return NextResponse.json(
      { error: normalized.message, code: normalized.code },
      { status: normalized.status }
    );
  }
}
