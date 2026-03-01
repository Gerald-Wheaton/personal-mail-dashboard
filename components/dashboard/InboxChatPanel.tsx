"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, ArrowUp } from "lucide-react";
import type { InboxChatMessage, ThreadListItem, TokenUsage, UnreadSender } from "@/lib/types";

// ─── Preset Prompts ───────────────────────────────────────────────────────────

const PRESET_PROMPTS = [
  {
    label: "Daily Summary",
    description: "What's new, who's unread, key updates",
    prompt:
      "Give me a daily summary of my inbox. What's new today, who is unread, what are the key threads and updates I should know about, and are there any new requirements or action items for me?",
  },
  {
    label: "Who Needs Me",
    description: "Mentions, asks, and pending replies",
    prompt:
      "Who has specifically asked something of me or directly mentioned me in my inbox? Summarize all unread mentions, direct questions, and pending action items that are directed at me specifically.",
  },
];

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
        className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/60"
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
            <Stat label="Prompt" value={session.promptTokens} color="text-blue-400" />
            <Stat label="Completion" value={session.completionTokens} color="text-emerald-400" />
            <Stat label="Total" value={session.totalTokens} color="text-foreground" />
          </div>

          {last && (
            <>
              <div className="my-2.5 border-t border-border/40" />
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Last Request
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Prompt" value={last.promptTokens} color="text-blue-400" />
                <Stat label="Completion" value={last.completionTokens} color="text-emerald-400" />
                <Stat label="Total" value={last.totalTokens} color="text-foreground" />
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

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className={`text-sm font-semibold ${color}`}>{value.toLocaleString()}</p>
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
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Scope
        </p>
        {!allSelected && (
          <button
            onClick={onSelectAll}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <button
        onClick={onSelectAll}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] transition-colors ${
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
        <span className="font-medium">All Inbox</span>
        <Badge variant="secondary" className="ml-auto text-xs">
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
                className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-[15px] transition-colors ${
                  checked
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/30"
                }`}
              >
                <span
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${
                    checked ? "border-primary bg-primary" : "border-border bg-background"
                  } flex items-center justify-center`}
                >
                  {checked && (
                    <svg viewBox="0 0 8 8" className="h-2 w-2 fill-primary-foreground">
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
                  <span className="block truncate text-xs opacity-60">
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

export function InboxChatPanel({
  threads,
  unreadTotal,
  unreadSenders,
}: {
  threads: ThreadListItem[];
  unreadTotal: number;
  unreadSenders: UnreadSender[];
}) {
  const [messages, setMessages] = useState<InboxChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sessionUsage, setSessionUsage] = useState<TokenUsage>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load persisted history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/inbox/chat");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        if (data.needsMigration) {
          setNeedsMigration(true);
          return;
        }
        setMessages(
          (data.messages ?? []).map(
            (m: {
              id: number;
              role: string;
              content: string;
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

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);
    try {
      const res = await fetch("/api/migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Migration failed");
      setNeedsMigration(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  // Scroll to bottom whenever messages change or while a response is pending
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

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

  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);

    const optimisticUser: InboxChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const body: { question: string; threadIds?: string[] } = { question: text };
      if (selectedIds.size > 0) {
        body.threadIds = Array.from(selectedIds);
      }

      const res = await fetch("/api/inbox/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

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
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    const text = question;
    setQuestion("");
    resetTextarea();
    sendMessage(text);
  };

  const handlePresetSend = (prompt: string) => {
    sendMessage(prompt);
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
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      {/* ── Compact Unread Strip ── */}
      <div className="flex items-center gap-3 overflow-x-auto rounded-xl border border-border/40 bg-card/60 px-4 py-2.5 shrink-0">
        <span className="shrink-0 text-sm font-semibold text-foreground">
          {unreadTotal} Unread
        </span>
        <div className="h-4 w-px shrink-0 bg-border/60" />
        {unreadSenders.length ? (
          unreadSenders.map((sender) => (
            <div
              key={sender.email}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-1 text-xs"
            >
              <span className="font-medium text-foreground">
                {sender.name || sender.email}
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 font-semibold text-primary">
                {sender.unreadCount}
              </span>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No unread senders</span>
        )}
      </div>

      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* ── Left: Thread Scope Picker ── */}
        <Card className="flex flex-col border border-border/60 bg-card/70 p-4 h-full overflow-hidden">
          <ScopePicker
            threads={threads}
            selectedIds={selectedIds}
            onToggle={handleToggleThread}
            onSelectAll={handleSelectAll}
          />
        </Card>

        {/* ── Right: Chat Interface ── */}
        <Card className="flex flex-col border border-border/60 bg-card/70 h-full overflow-hidden">
          <CardHeader className="flex shrink-0 flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Inbox Q&amp;A
              </p>
              <h3 className="text-xl font-semibold text-foreground">
                Ask your inbox
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Scope:{" "}
                <span className="font-medium text-foreground">{scopeLabel}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TokenBadge session={sessionUsage} last={lastUsage} />
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            {/* Messages */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-4"
            >
              <div className="flex flex-col gap-4">
                {loading ? (
                  <p className="text-base text-muted-foreground">Loading history…</p>
                ) : needsMigration ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <p className="text-base text-muted-foreground">
                      The inbox chat table hasn&apos;t been created yet.
                    </p>
                    <button
                      onClick={handleMigrate}
                      disabled={migrating}
                      className="rounded-lg bg-primary px-4 py-2 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {migrating ? "Applying migration…" : "Apply migration"}
                    </button>
                    <p className="text-xs text-muted-foreground/60">
                      or run <code className="font-mono">bun run db:migrate</code> in your terminal
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col gap-2 py-6 text-center">
                    <p className="text-base text-muted-foreground">
                      Ask anything about your inbox.
                    </p>
                    <p className="text-sm text-muted-foreground/60">
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
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-base ${
                          msg.role === "user"
                            ? "rounded-br-sm bg-secondary/50 text-foreground"
                            : "rounded-bl-sm bg-primary/10 text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.role === "assistant" && msg.totalTokens != null && (
                          <p className="mt-2 text-[11px] text-muted-foreground/50">
                            {msg.promptTokens?.toLocaleString()} prompt ·{" "}
                            {msg.completionTokens?.toLocaleString()} completion
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {sending && (
                  <div className="flex justify-start">
                    <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-primary/10 px-4 py-3 text-base">
                      <p className="text-muted-foreground">Thinking…</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-base text-destructive">{error}</p>
            )}

            {/* Compound chat input */}
            <div className="mx-auto w-full max-w-2xl shrink-0">
              <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm transition-[border-color,box-shadow] focus-within:border-border focus-within:shadow-md">
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Has anyone confirmed the date? Did we get the invoice?"
                  disabled={sending || needsMigration}
                  rows={2}
                  className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-base leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
                />
                {/* Footer row */}
                <div className="flex items-center justify-between px-3 pb-3">
                  {/* Left: Quick prompts */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={sending || needsMigration}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground disabled:opacity-40"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Prompts</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Quick Prompts
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {PRESET_PROMPTS.map((p) => (
                        <DropdownMenuItem
                          key={p.label}
                          onClick={() => handlePresetSend(p.prompt)}
                          className="flex flex-col items-start gap-0.5 py-2"
                        >
                          <span className="font-medium">{p.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.description}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Right: Send button */}
                  <button
                    onClick={handleSend}
                    disabled={sending || !question.trim() || needsMigration}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                  >
                    {sending ? (
                      <span className="text-xs font-medium">…</span>
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-center text-xs text-muted-foreground/50">
                Shift+Enter for new line · Enter to send
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
