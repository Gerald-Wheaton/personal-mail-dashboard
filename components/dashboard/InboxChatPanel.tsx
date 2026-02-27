"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { InboxChatMessage, ThreadListItem, TokenUsage } from "@/lib/types";

// ─── Token Usage Badge ────────────────────────────────────────────────────────

function TokenBadge({
  session,
  last,
}: {
  session: TokenUsage;
  last: TokenUsage | null;
}) {
  const [open, setOpen] = useState(false);

  if (session.totalTokens === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary/60"
      >
        <span className="font-medium text-foreground">
          {session.totalTokens.toLocaleString()}
        </span>
        <span>tokens used</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-border/60 bg-card p-3 shadow-lg">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Session Usage
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat
              label="Prompt"
              value={session.promptTokens}
              color="text-blue-400"
            />
            <Stat
              label="Completion"
              value={session.completionTokens}
              color="text-emerald-400"
            />
            <Stat
              label="Total"
              value={session.totalTokens}
              color="text-foreground"
            />
          </div>

          {last && (
            <>
              <div className="my-2.5 border-t border-border/40" />
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Last Request
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat
                  label="Prompt"
                  value={last.promptTokens}
                  color="text-blue-400"
                />
                <Stat
                  label="Completion"
                  value={last.completionTokens}
                  color="text-emerald-400"
                />
                <Stat
                  label="Total"
                  value={last.totalTokens}
                  color="text-foreground"
                />
              </div>
            </>
          )}

          <p className="mt-3 text-[10px] text-muted-foreground">
            gpt-4o-mini: ~$0.15 / 1M prompt · ~$0.60 / 1M completion
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <p className={`text-sm font-semibold ${color}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Thread Scope Picker ──────────────────────────────────────────────────────

function ScopePicker({
  threads,
  selectedIds,
  onToggle,
  onSelectAll,
}: {
  threads: ThreadListItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}) {
  const allSelected = selectedIds.size === 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Scope
        </p>
        {!allSelected && (
          <button
            onClick={onSelectAll}
            className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <button
        onClick={onSelectAll}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          allSelected
            ? "bg-primary/15 text-foreground"
            : "text-muted-foreground hover:bg-secondary/40"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full border-2 ${
            allSelected ? "border-primary bg-primary" : "border-border"
          } flex items-center justify-center`}
        >
          {allSelected && (
            <svg viewBox="0 0 8 8" className="h-2 w-2 fill-primary-foreground">
              <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </span>
        <span className="font-medium">All Inbox</span>
        <Badge
          variant="secondary"
          className="ml-auto text-[10px]"
        >
          {threads.length}
        </Badge>
      </button>

      <ScrollArea className="flex-1 rounded-xl border border-border/40 bg-background/30">
        <div className="flex flex-col gap-0.5 p-2">
          {threads.map((thread) => {
            const checked = selectedIds.has(thread.id);
            return (
              <button
                key={thread.id}
                onClick={() => onToggle(thread.id)}
                className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  checked
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/30"
                }`}
              >
                <span
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${
                    checked
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  } flex items-center justify-center`}
                >
                  {checked && (
                    <svg
                      viewBox="0 0 8 8"
                      className="h-2 w-2 fill-primary-foreground"
                    >
                      <path
                        d="M1 4l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium leading-tight">
                    {thread.subject || "(no subject)"}
                  </span>
                  <span className="block truncate text-[11px] opacity-60">
                    {thread.lastFromName ?? thread.lastFromEmail ?? ""}
                  </span>
                </span>
                {thread.unreadCount > 0 && (
                  <span className="mt-0.5 shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {thread.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InboxChatPanel({ threads }: { threads: ThreadListItem[] }) {
  const [messages, setMessages] = useState<InboxChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sessionUsage, setSessionUsage] = useState<TokenUsage>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load persisted history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/inbox/chat");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setMessages(
          (data.messages ?? []).map(
            (m: {
              id: number;
              role: string;
              content: string;
              prompt_tokens?: number;
              completion_tokens?: number;
              total_tokens?: number;
              promptTokens?: number;
              completionTokens?: number;
              totalTokens?: number;
              createdAt: string;
            }) => ({
              ...m,
              role: m.role as "user" | "assistant",
            })
          )
        );
      } catch {
        // history load failure is non-fatal
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggleThread = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => setSelectedIds(new Set());

  const handleSend = async () => {
    if (!question.trim() || sending) return;
    setSending(true);
    setError(null);

    const optimisticUser: InboxChatMessage = {
      id: Date.now(),
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    const sentQuestion = question;
    setQuestion("");

    try {
      const body: { question: string; threadIds?: string[] } = {
        question: sentQuestion,
      };
      if (selectedIds.size > 0) {
        body.threadIds = Array.from(selectedIds);
      }

      const res = await fetch("/api/inbox/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      const assistantMsg: InboxChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer,
        promptTokens: data.usage?.promptTokens,
        completionTokens: data.usage?.completionTokens,
        totalTokens: data.usage?.totalTokens,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.usage) {
        const u = data.usage as TokenUsage;
        setLastUsage(u);
        setSessionUsage((prev) => ({
          promptTokens: prev.promptTokens + u.promptTokens,
          completionTokens: prev.completionTokens + u.completionTokens,
          totalTokens: prev.totalTokens + u.totalTokens,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      // Remove the optimistic user bubble on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    try {
      await fetch("/api/inbox/chat", { method: "DELETE" });
      setMessages([]);
      setSessionUsage({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
      setLastUsage(null);
    } catch {
      // ignore
    }
  };

  const scopeLabel =
    selectedIds.size === 0
      ? "All Inbox"
      : `${selectedIds.size} thread${selectedIds.size === 1 ? "" : "s"}`;

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ── Left: Thread Scope Picker ── */}
      <Card className="flex flex-col border border-border/60 bg-card/70 p-4">
        <ScopePicker
          threads={threads}
          selectedIds={selectedIds}
          onToggle={handleToggleThread}
          onSelectAll={handleSelectAll}
        />
      </Card>

      {/* ── Right: Chat Interface ── */}
      <Card className="flex flex-col border border-border/60 bg-card/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Inbox Q&amp;A
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              Ask your inbox
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Scope:{" "}
              <span className="font-medium text-foreground">{scopeLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TokenBadge session={sessionUsage} last={lastUsage} />
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="text-[11px] text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Messages */}
          <ScrollArea className="flex-1 rounded-xl border border-border/60 bg-background/40 p-3">
            <div ref={scrollRef} className="flex flex-col gap-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading history…
                </p>
              ) : messages.length === 0 ? (
                <div className="flex flex-col gap-2 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ask anything about your inbox.
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    e.g. &ldquo;Has anyone confirmed the meeting date?&rdquo;
                    <br />
                    &ldquo;Did Acme send the invoice?&rdquo;
                    <br />
                    &ldquo;What&apos;s pending from last week?&rdquo;
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl px-3 py-2.5 text-sm ${
                      msg.role === "assistant"
                        ? "bg-primary/10 text-foreground"
                        : "bg-secondary/40 text-foreground"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      {msg.role}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && msg.totalTokens != null && (
                      <p className="mt-1.5 text-[10px] text-muted-foreground/50">
                        {msg.promptTokens?.toLocaleString()} prompt ·{" "}
                        {msg.completionTokens?.toLocaleString()} completion
                      </p>
                    )}
                  </div>
                ))
              )}
              {sending && (
                <div className="rounded-xl bg-primary/10 px-3 py-2.5 text-sm">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    assistant
                  </p>
                  <p className="mt-1 text-muted-foreground">Thinking…</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Has anyone confirmed the date? Did we get the invoice?"
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={sending || !question.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? "…" : "Ask"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
