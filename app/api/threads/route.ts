import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, threads } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const threadRows = await db
      .select({
        id: threads.id,
        subject: threads.subject,
        snippet: threads.snippet,
        lastMessageAt: threads.lastMessageAt,
        unreadCount: threads.unreadCount,
        labels: threads.labels,
      })
      .from(threads)
      .orderBy(desc(threads.lastMessageAt));

    const unreadTotal = threadRows.reduce(
      (acc, thread) => acc + (thread.unreadCount ?? 0),
      0
    );

    const unreadSenders = await db
      .select({
        email: messages.fromEmail,
        name: sql<string | null>`max(${messages.fromName})`,
        unreadCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(messages)
      .where(eq(messages.isUnread, true))
      .groupBy(messages.fromEmail);

    return NextResponse.json({
      threads: threadRows,
      unreadTotal,
      unreadSenders: unreadSenders
        .filter((row) => row.email)
        .map((row) => ({
          email: row.email ?? "",
          name: row.name ?? undefined,
          unreadCount: row.unreadCount,
        })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
