import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ThreadListItem } from "@/lib/types";

function formatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
}

export function ThreadList({
  threads,
  selectedId,
  loading,
  onSelect,
}: {
  threads: ThreadListItem[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="flex h-[72vh] flex-col border border-border/60 bg-card/70">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Threads
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Focused Inbox
        </h2>
      </div>
      <ScrollArea className="flex-1 px-2 pb-3 pt-2">
        {loading ? (
          <div className="px-3 py-8 text-sm text-muted-foreground">
            Loading threads...
          </div>
        ) : threads.length ? (
          <div className="flex flex-col gap-2">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-left transition ${
                  thread.id === selectedId
                    ? "border-primary/60 bg-primary/10"
                    : "border-border/60 bg-background/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {thread.subject || "(no subject)"}
                  </p>
                  {thread.unreadCount ? (
                    <Badge className="bg-primary text-primary-foreground">
                      {thread.unreadCount}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {thread.snippet}
                </p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {formatTime(thread.lastMessageAt)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-3 py-8 text-sm text-muted-foreground">
            No threads cached yet. Sync to load Primary + FM360.
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
