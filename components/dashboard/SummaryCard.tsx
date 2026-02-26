"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ThreadSummary } from "@/lib/types";

type SummaryErrorState = {
  message: string;
  errorCode?: string;
  actionUrl?: string;
};

export function SummaryCard({
  summary,
  threadId,
  onSummaryUpdated,
  loading,
}: {
  summary: ThreadSummary | null;
  threadId: string | null;
  onSummaryUpdated: (summary: ThreadSummary | null) => void;
  loading: boolean;
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<SummaryErrorState | null>(null);

  const handleGenerate = async () => {
    if (!threadId) return;
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/threads/${threadId}/summary`, {
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorCode =
          data && typeof data.errorCode === "string" ? data.errorCode : undefined;
        const actionUrl =
          data && typeof data.actionUrl === "string" ? data.actionUrl : undefined;
        const backendMessage =
          data && typeof data.error === "string" ? data.error : null;

        const message =
          errorCode === "OPENAI_QUOTA_EXCEEDED"
            ? "You are out of OpenAI tokens/credits for summaries. Add more tokens, then retry."
            : backendMessage ?? "Unable to generate summary";

        setError({ message, errorCode, actionUrl });
        return;
      }

      onSummaryUpdated({
        threadId: data.threadId,
        summaryText: data.summaryText,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border border-border/60 bg-card/70">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Summary
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Thread Brief
          </h3>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!threadId || generating || loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {generating ? "Generating..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error.message}</p>
            {error.errorCode === "OPENAI_QUOTA_EXCEEDED" && error.actionUrl ? (
              <Button asChild variant="secondary">
                <a href={error.actionUrl} target="_blank" rel="noopener noreferrer">
                  Get more tokens
                </a>
              </Button>
            ) : null}
          </div>
        ) : summary ? (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
            {summary.summaryText}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No summary yet. Generate to get a concise overview.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
