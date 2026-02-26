import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  page,
  totalPages,
  search,
  labelFilter,
  rangeFilter,
  unreadOnly,
  onPageChange,
  onSearchChange,
  onLabelChange,
  onRangeChange,
  onUnreadOnlyChange,
}: {
  threads: ThreadListItem[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  page: number;
  totalPages: number;
  search: string;
  labelFilter: "both" | "primary" | "fm360";
  rangeFilter: "all" | "7d" | "30d" | "90d";
  unreadOnly: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onLabelChange: (value: "both" | "primary" | "fm360") => void;
  onRangeChange: (value: "all" | "7d" | "30d" | "90d") => void;
  onUnreadOnlyChange: (value: boolean) => void;
}) {
  return (
    <Card className="flex h-[72vh] flex-col overflow-hidden border border-border/60 bg-card/70">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Threads
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Focused Inbox
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search subject, sender, snippet..."
            className="bg-background/40"
          />
          <div className="flex flex-wrap gap-2">
            <Select value={labelFilter} onValueChange={onLabelChange}>
              <SelectTrigger className="h-9 w-[120px] bg-background/40">
                <SelectValue placeholder="Label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">All</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="fm360">FM360</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rangeFilter} onValueChange={onRangeChange}>
              <SelectTrigger className="h-9 w-[130px] bg-background/40">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant={unreadOnly ? "default" : "secondary"}
              className={
                unreadOnly
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40"
              }
              onClick={() => onUnreadOnlyChange(!unreadOnly)}
            >
              Unread
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-2 pb-3 pt-2">
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
                  <p className="text-xs text-muted-foreground">
                    {thread.lastFromName || thread.lastFromEmail}
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
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-secondary/40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-secondary/40"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
