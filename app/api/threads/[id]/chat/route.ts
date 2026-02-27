import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, messages } from "@/lib/schema";
import { asc, desc, eq } from "drizzle-orm";
import { aiChat } from "@/lib/ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const question = String(body?.question ?? "").trim();
    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, id))
      .orderBy(asc(messages.date));

    if (!threadMessages.length) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.threadId, id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);

    const threadContext = threadMessages
      .map((msg) => {
        const from = msg.fromName
          ? `${msg.fromName} <${msg.fromEmail}>`
          : msg.fromEmail || "Unknown";
        const date = msg.date ? msg.date.toISOString() : "";
        const bodyText = msg.bodyText || msg.bodyHtml || "";
        return `From: ${from}\nDate: ${date}\nSubject: ${msg.subject ?? ""}\n${bodyText}`;
      })
      .join("\n\n---\n\n");

    const conversation = history
      .slice()
      .reverse()
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    const { content: answer } = await aiChat([
      {
        role: "system",
        content:
          "Answer questions using only the provided email thread context. If the answer is not in the thread, say you are not sure.",
      },
      { role: "user", content: `Thread context:\n${threadContext}` },
      ...conversation,
      { role: "user", content: question },
    ]);

    if (!answer) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    await db.insert(chatMessages).values({
      threadId: id,
      role: "user",
      content: question,
      createdAt: new Date(),
    });
    await db.insert(chatMessages).values({
      threadId: id,
      role: "assistant",
      content: answer,
      createdAt: new Date(),
    });

    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
