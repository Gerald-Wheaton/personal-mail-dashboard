import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, threads } from "@/lib/schema";
import { and, desc, eq, ilike, sql, gte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const page = Math.max(1, Number(requestUrl.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, Number(requestUrl.searchParams.get("pageSize") ?? "25")));
    const search = (requestUrl.searchParams.get("search") ?? "").trim();
    const unreadOnly = requestUrl.searchParams.get("unreadOnly") === "true";
    const label = requestUrl.searchParams.get("label") ?? "both";
    const range = requestUrl.searchParams.get("range") ?? "all";

    const filters = [];
    if (unreadOnly) {
      filters.push(sql`${threads.unreadCount} > 0`);
    }
    if (label === "primary") {
      filters.push(sql`${threads.labels} ? ${"CATEGORY_PERSONAL"}`);
    }
    if (label === "fm360") {
      filters.push(sql`${threads.labels} ? ${"FM360"}`);
    }
    if (range !== "all") {
      const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
      const since = new Date();
      since.setDate(since.getDate() - days);
      filters.push(gte(threads.lastMessageAt, since));
    }
    if (search) {
      const like = `%${search}%`;
      filters.push(
        sql`(${ilike(threads.subject, like)} OR ${ilike(threads.snippet, like)} OR ${ilike(threads.lastFromName, like)} OR ${ilike(threads.lastFromEmail, like)})`
      );
    }

    const whereClause = filters.length ? and(...filters) : undefined;

    const baseQuery = db
      .select({
        id: threads.id,
        subject: threads.subject,
        snippet: threads.snippet,
        lastMessageAt: threads.lastMessageAt,
        unreadCount: threads.unreadCount,
        labels: threads.labels,
        lastFromName: threads.lastFromName,
        lastFromEmail: threads.lastFromEmail,
      })
      .from(threads);

    const threadRows = await (whereClause ? baseQuery.where(whereClause) : baseQuery)
      .orderBy(desc(threads.lastMessageAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const countQuery = db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(threads);
    const totalRows = await (whereClause ? countQuery.where(whereClause) : countQuery);
    const total = totalRows[0]?.count ?? 0;

    const unreadTotalRows = await db
      .select({ total: sql<number>`coalesce(sum(${threads.unreadCount}), 0)`.mapWith(Number) })
      .from(threads);
    const unreadTotal = unreadTotalRows[0]?.total ?? 0;

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
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
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
