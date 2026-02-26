import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, messages, summaries, threads } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const thread = await db
      .select()
      .from(threads)
      .where(eq(threads.id, id));
    if (!thread.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, id))
      .orderBy(asc(messages.date));

    const summary = await db
      .select()
      .from(summaries)
      .where(eq(summaries.threadId, id));

    const chat = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, id))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({
      thread: thread[0],
      messages: threadMessages,
      summary: summary[0] ?? null,
      chat,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
