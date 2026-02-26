import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, summaries } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { openai, openaiModel } from "@/lib/openai";

const OPENAI_BILLING_URL =
  "https://platform.openai.com/settings/organization/billing/overview";

function isOpenAIQuotaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as {
    status?: number;
    code?: string;
    message?: string;
    error?: { code?: string; message?: string };
  };
  const status = maybeError.status;
  const code = maybeError.code ?? maybeError.error?.code;
  const message = (maybeError.message ?? maybeError.error?.message ?? "").toLowerCase();
  return (
    status === 429 &&
    (code === "insufficient_quota" ||
      message.includes("exceeded your current quota") ||
      message.includes("insufficient_quota") ||
      message.includes("quota"))
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, id))
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
        threadId: id,
        summaryText,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: summaries.threadId,
        set: { summaryText, updatedAt: new Date() },
      });

    return NextResponse.json({ threadId: id, summaryText });
  } catch (error) {
    if (isOpenAIQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "No OpenAI tokens/credits left for summary generation. Add billing credits, then try again.",
          errorCode: "OPENAI_QUOTA_EXCEEDED",
          actionUrl: OPENAI_BILLING_URL,
        },
        { status: 429 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
