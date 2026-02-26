import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UnreadSender } from "@/lib/types";

export function UnreadSenders({
  unreadTotal,
  senders,
}: {
  unreadTotal: number;
  senders: UnreadSender[];
}) {
  return (
    <Card className="w-full border border-border/60 bg-card/80">
      <CardHeader className="">
        <div className="flex items-center gap-8">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Unread Overview
          </p>
        </div>
      </CardHeader>
      <CardContent className="w-full pt-0">
        <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-8">
          <h2 className="text-5xl font-bold tracking-tight text-foreground">
            {unreadTotal} Unread
          </h2>
          <div className="flex w-full flex-wrap items-start justify-center gap-3">
            {senders.length ? (
              senders.map((sender) => (
                <button
                  key={sender.email}
                  type="button"
                  className="inline-flex items-center gap-3 rounded-lg border border-border/70 bg-background/50 px-4 py-2 text-sm text-foreground transition hover:border-primary/50 hover:bg-primary/10"
                >
                  <span className="font-medium">
                    {sender.name || sender.email}
                  </span>
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                    {sender.unreadCount}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No unread senders yet.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
