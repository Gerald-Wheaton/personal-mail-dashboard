import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TopBar({
  onSync,
  loading,
  inboxChatMode,
  onToggleInboxChat,
}: {
  onSync: () => void;
  loading: boolean;
  inboxChatMode: boolean;
  onToggleInboxChat: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Gmail Command Deck
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Primary + FM360
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleInboxChat}
          variant={inboxChatMode ? "default" : "secondary"}
          className={
            inboxChatMode
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border/60 bg-secondary/50"
          }
        >
          {inboxChatMode ? "← Back to Inbox" : "Inbox Chat"}
        </Button>
        <Button
          variant="secondary"
          className="border border-border/60 bg-secondary/50"
          asChild
        >
          <Link href="/api/auth/google/start">Connect Gmail</Link>
        </Button>
        <Button
          onClick={onSync}
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "Syncing..." : "Sync Now"}
        </Button>
      </div>
    </div>
  );
}
