"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/lib/types";

export function ChatPanel({
  threadId,
  messages,
  onChatUpdated,
  loading,
}: {
  threadId: string | null;
  messages: ChatMessage[];
  onChatUpdated: (messages: ChatMessage[]) => void;
  loading: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!threadId || !question.trim()) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/threads/${threadId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) {
        throw new Error("Unable to get answer");
      }
      const data = await response.json();
      const newMessages: ChatMessage[] = [
        ...messages,
        {
          id: Date.now(),
          threadId,
          role: "user",
          content: question,
          createdAt: new Date().toISOString(),
        },
        {
          id: Date.now() + 1,
          threadId,
          role: "assistant",
          content: data.answer,
          createdAt: new Date().toISOString(),
        },
      ];
      onChatUpdated(newMessages);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="flex h-[48vh] flex-col border border-border/60 bg-card/70">
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Thread Q&A
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          Ask this chain
        </h3>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ScrollArea className="flex-1 rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="flex flex-col gap-3">
            {messages.length ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    message.role === "assistant"
                      ? "bg-primary/10 text-foreground"
                      : "bg-secondary/40 text-foreground"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {message.role}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Ask a question about this thread.
              </p>
            )}
          </div>
        </ScrollArea>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What do they need from me?"
            disabled={!threadId || loading}
          />
          <Button
            onClick={handleSend}
            disabled={!threadId || sending || !question.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {sending ? "Sending" : "Ask"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
