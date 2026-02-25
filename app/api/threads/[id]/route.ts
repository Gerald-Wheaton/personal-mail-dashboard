import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, messages, summaries, threads } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const thread = await db
      .select()
      .from(threads)
      .where(eq(threads.id, params.id));
    if (!thread.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, params.id))
      .orderBy(asc(messages.date));

    const summary = await db
      .select()
      .from(summaries)
      .where(eq(summaries.threadId, params.id));

    const chat = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, params.id))
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
