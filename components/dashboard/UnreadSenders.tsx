import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UnreadSender } from "@/lib/types";

export function UnreadSenders({
  unreadTotal,
  senders,
}: {
  unreadTotal: number;
  senders: UnreadSender[];
}) {
  return (
    <Card className="border border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Unread Overview
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {unreadTotal} unread
          </h2>
        </div>
        <Badge className="border border-primary/50 bg-primary/10 text-primary">
          Primary + FM360
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[120px]">
          <div className="flex flex-wrap gap-2">
            {senders.length ? (
              senders.map((sender) => (
                <div
                  key={sender.email}
                  className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-foreground"
                >
                  <span className="font-medium">
                    {sender.name || sender.email}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {sender.unreadCount}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No unread senders yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
