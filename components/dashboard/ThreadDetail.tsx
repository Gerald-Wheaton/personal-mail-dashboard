"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadListItem, ThreadMessage } from "@/lib/types";

function formatTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
}

export function ThreadDetail({
  thread,
  messages,
  loading,
}: {
  thread: ThreadListItem | null;
  messages: ThreadMessage[];
  loading: boolean;
}) {
  const [mode, setMode] = useState("reply");
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!thread) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/threads/${thread.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, mode }),
      });
      if (!response.ok) {
        throw new Error("Unable to send reply.");
      }
      setReplyBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="flex h-[72vh] flex-col border border-border/60 bg-card/70">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Thread Detail
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {thread?.subject || "Select a thread"}
          </h2>
        </div>
        {thread ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Reply
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border/60 bg-card">
              <DialogHeader>
                <DialogTitle>Send Reply</DialogTitle>
              </DialogHeader>
              <Tabs value={mode} onValueChange={setMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="reply">Reply</TabsTrigger>
                  <TabsTrigger value="reply-all">Reply All</TabsTrigger>
                </TabsList>
              </Tabs>
              <Textarea
                rows={6}
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Write a quick, focused reply..."
              />
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <Button
                onClick={handleSend}
                disabled={sending || !replyBody.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {sending ? "Sending..." : "Send Reply"}
              </Button>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>
      <ScrollArea className="flex-1 px-4 py-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading thread...</div>
        ) : thread ? (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl border px-4 py-3 ${
                  message.isUnread
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/60 bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {message.fromName || message.fromEmail || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {message.fromEmail}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {formatTime(message.date)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
                  {message.bodyText || message.bodyHtml || "(No preview)"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a thread from the left.
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
