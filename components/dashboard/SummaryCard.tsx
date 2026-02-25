"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ThreadSummary } from "@/lib/types";

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
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!threadId) return;
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/threads/${threadId}/summary`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Unable to generate summary");
      }
      const data = await response.json();
      onSummaryUpdated({
        threadId: data.threadId,
        summaryText: data.summaryText,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
          <p className="text-sm text-destructive">{error}</p>
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
