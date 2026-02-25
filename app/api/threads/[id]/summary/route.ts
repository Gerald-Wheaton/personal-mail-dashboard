import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, summaries } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { openai, openaiModel } from "@/lib/openai";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, params.id))
      .orderBy(asc(messages.date));

    if (!threadMessages.length) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const formatted = threadMessages
      .map((msg) => {
        const from = msg.fromName
          ? `${msg.fromName} <${msg.fromEmail}>`
          : msg.fromEmail || "Unknown";
        const date = msg.date ? msg.date.toISOString() : "";
        const body = msg.bodyText || msg.bodyHtml || "";
        return `From: ${from}\nDate: ${date}\nSubject: ${msg.subject ?? ""}\n${body}`;
      })
      .join("\n\n---\n\n");

    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: "system",
          content:
            "You summarize email threads. Provide a concise summary with key decisions, asks, and next steps. Keep it under 120 words.",
        },
        { role: "user", content: formatted },
      ],
      temperature: 0.2,
    });

    const summaryText = response.choices[0]?.message?.content?.trim() ?? "";
    if (!summaryText) {
      return NextResponse.json({ error: "Empty summary" }, { status: 500 });
    }

    await db
      .insert(summaries)
      .values({
        threadId: params.id,
        summaryText,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: summaries.threadId,
        set: { summaryText, updatedAt: new Date() },
      });

    return NextResponse.json({ threadId: params.id, summaryText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
