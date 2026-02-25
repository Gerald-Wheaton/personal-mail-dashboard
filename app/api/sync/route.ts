import { NextResponse } from "next/server";
import { getGmailClient, buildGmailQuery } from "@/lib/gmail";
import { db } from "@/lib/db";
import { messages, threads } from "@/lib/schema";
import { parseMessage } from "@/lib/gmail-parsers";

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

      await db
        .insert(threads)
        .values({
          id: threadId,
          subject,
          snippet,
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
