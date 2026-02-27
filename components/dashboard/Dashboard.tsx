"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ThreadDetail } from "@/components/dashboard/ThreadDetail";
import { ThreadList } from "@/components/dashboard/ThreadList";
import { TopBar } from "@/components/dashboard/TopBar";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { InboxChatPanel } from "@/components/dashboard/InboxChatPanel";
import { UnreadSenders } from "@/components/dashboard/UnreadSenders";
import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";
import type { ThreadListItem, ThreadMessage, ThreadSummary, ChatMessage, UnreadSender } from "@/lib/types";

export function Dashboard() {
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [summary, setSummary] = useState<ThreadSummary | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadSenders, setUnreadSenders] = useState<UnreadSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState<"both" | "primary" | "fm360">(
    "both"
  );
  const [rangeFilter, setRangeFilter] = useState<"all" | "7d" | "30d" | "90d">(
    "all"
  );
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [inboxChatMode, setInboxChatMode] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        label: labelFilter,
        range: rangeFilter,
        unreadOnly: String(unreadOnly),
      });
      const response = await fetch(`/api/threads?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Unable to load threads");
      }
      const data = await response.json();
      setThreads(data.threads ?? []);
      setUnreadTotal(data.unreadTotal ?? 0);
      setUnreadSenders(data.unreadSenders ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      if (!selectedThreadId && data.threads?.length) {
        setSelectedThreadId(data.threads[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [
    labelFilter,
    page,
    pageSize,
    rangeFilter,
    search,
    selectedThreadId,
    unreadOnly,
  ]);

  const loadThreadDetail = useCallback(async (threadId: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/threads/${threadId}`);
      if (!response.ok) {
        throw new Error("Unable to load thread");
      }
      const data = await response.json();
      setMessages(data.messages ?? []);
      setSummary(data.summary ?? null);
      setChat(data.chat ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchText.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (selectedThreadId) {
      loadThreadDetail(selectedThreadId);
    }
  }, [selectedThreadId, loadThreadDetail]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      if (!response.ok) {
        throw new Error("Sync failed. Connect Gmail first.");
      }
      await loadThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell relative">
      <div className="grain" />
      <IdeationNavbar />
      <div className={`relative z-10 mx-auto max-w-[1500px] flex flex-col gap-6 px-6 py-8 ${inboxChatMode ? "h-dvh overflow-hidden" : "min-h-screen"}`}>
        <TopBar
          onSync={handleSync}
          loading={loading}
          inboxChatMode={inboxChatMode}
          onToggleInboxChat={() => setInboxChatMode((v) => !v)}
        />
        <UnreadSenders unreadTotal={unreadTotal} senders={unreadSenders} />

        {error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {inboxChatMode ? (
          <InboxChatPanel threads={threads} />
        ) : (
          <div className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
            <ThreadList
              threads={threads}
              selectedId={selectedThreadId}
              loading={loading}
              onSelect={setSelectedThreadId}
              page={page}
              totalPages={totalPages}
              search={searchText}
              labelFilter={labelFilter}
              rangeFilter={rangeFilter}
              unreadOnly={unreadOnly}
              onPageChange={setPage}
              onSearchChange={setSearchText}
              onLabelChange={(value) => {
                setPage(1);
                setLabelFilter(value);
              }}
              onRangeChange={(value) => {
                setPage(1);
                setRangeFilter(value);
              }}
              onUnreadOnlyChange={(value) => {
                setPage(1);
                setUnreadOnly(value);
              }}
            />
            <ThreadDetail
              thread={selectedThread}
              messages={messages}
              loading={detailLoading}
            />
            <div className="flex flex-col gap-6">
              <SummaryCard
                summary={summary}
                threadId={selectedThreadId}
                onSummaryUpdated={setSummary}
                loading={detailLoading}
              />
              <ChatPanel
                threadId={selectedThreadId}
                messages={chat}
                onChatUpdated={setChat}
                loading={detailLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
