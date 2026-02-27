import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxChatMessages, threads, messages } from "@/lib/schema";
import { asc, desc, inArray } from "drizzle-orm";
import { aiChat, billingUrl, isQuotaError } from "@/lib/ai";

function isMissingTableError(error: unknown): boolean {
  // PostgreSQL error code 42P01 = "relation does not exist"
  return (
    error != null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "42P01"
  );
}

export async function GET() {
  try {
    const history = await db
      .select()
      .from(inboxChatMessages)
      .orderBy(asc(inboxChatMessages.createdAt))
      .limit(100);

    return NextResponse.json({ messages: history });
  } catch (error) {
    if (isMissingTableError(error)) {
      // Table hasn't been migrated yet — signal the UI without crashing
      return NextResponse.json({ messages: [], needsMigration: true });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body?.question ?? "").trim();
    const scopeThreadIds: string[] | undefined = body?.threadIds;

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    // Fetch threads from DB, scoped if requested
    const allThreads = scopeThreadIds?.length
      ? await db
          .select()
          .from(threads)
          .where(inArray(threads.id, scopeThreadIds))
      : await db.select().from(threads);

    if (!allThreads.length) {
      return NextResponse.json(
        { error: "No threads found. Sync your inbox first." },
        { status: 404 }
      );
    }

    const threadIds = allThreads.map((t) => t.id);

    const allMessages = await db
      .select()
      .from(messages)
      .where(inArray(messages.threadId, threadIds))
      .orderBy(asc(messages.date));

    // Group messages by thread
    const messagesByThread = new Map<
      string,
      (typeof allMessages)[number][]
    >();
    for (const msg of allMessages) {
      const list = messagesByThread.get(msg.threadId) ?? [];
      list.push(msg);
      messagesByThread.set(msg.threadId, list);
    }

    // Build context string — truncate bodies to keep within token budget
    const inboxContext = allThreads
      .map((thread) => {
        const msgs = messagesByThread.get(thread.id) ?? [];
        const msgsText = msgs
          .map((msg) => {
            const from = msg.fromName
              ? `${msg.fromName} <${msg.fromEmail}>`
              : msg.fromEmail ?? "Unknown";
            const date = msg.date ? msg.date.toISOString() : "";
            const bodySnippet = (msg.bodyText ?? "").slice(0, 1500);
            return `  From: ${from}\n  Date: ${date}\n  Body: ${bodySnippet}`;
          })
          .join("\n  ---\n");
        return `=== Thread: "${thread.subject ?? "(no subject)"}" ===\n${msgsText || "  (no messages)"}`;
      })
      .join("\n\n");

    // Fetch recent conversation history (graceful if table not yet migrated)
    let conversation: { role: "user" | "assistant"; content: string }[] = [];
    try {
      const history = await db
        .select()
        .from(inboxChatMessages)
        .orderBy(desc(inboxChatMessages.createdAt))
        .limit(10);
      conversation = history
        .slice()
        .reverse()
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
    } catch (historyError) {
      if (!isMissingTableError(historyError)) throw historyError;
      // Table not yet created — proceed without history
    }

    const { content: answer, usage } = await aiChat([
      {
        role: "system",
        content:
          "You are an assistant that answers questions about a Gmail inbox. Use only the provided email context. Be concise and direct. When referencing a specific thread, quote its subject in double quotes. If the answer is not in the inbox, say so clearly.",
      },
      { role: "user", content: `Inbox context:\n${inboxContext}` },
      ...conversation,
      { role: "user", content: question },
    ]);

    if (!answer) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    // Persist both turns (graceful if table not yet migrated — answer still returned)
    try {
      await db.insert(inboxChatMessages).values({
        role: "user",
        content: question,
        createdAt: new Date(),
      });
      await db.insert(inboxChatMessages).values({
        role: "assistant",
        content: answer,
        promptTokens: usage?.promptTokens ?? null,
        completionTokens: usage?.completionTokens ?? null,
        totalTokens: usage?.totalTokens ?? null,
        createdAt: new Date(),
      });
    } catch (insertError) {
      if (!isMissingTableError(insertError)) throw insertError;
      // Table not yet created — answers work, but history won't persist
    }

    return NextResponse.json({ answer, usage });
  } catch (error) {
    if (isQuotaError(error)) {
      return NextResponse.json(
        {
          error: "API quota exceeded.",
          errorCode: "OPENAI_QUOTA_EXCEEDED",
          actionUrl: billingUrl,
        },
        { status: 429 }
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(inboxChatMessages);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ ok: true });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
