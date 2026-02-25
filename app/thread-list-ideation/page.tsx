import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockThreads = [
  { subject: "FM360: Q1 roster update", snippet: "Need your confirmation on...", unread: 3 },
  { subject: "Invoice review", snippet: "Attached invoice for...", unread: 0 },
  { subject: "Recruiting sync", snippet: "Can we move the call...", unread: 1 },
];

export default function ThreadListIdeationPage() {
  return (
    <div className="app-shell relative">
      <div className="grain" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Ideation
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Thread List Variations
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">Dense, badge-led</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mockThreads.map((thread) => (
                <div
                  key={thread.subject}
                  className="rounded-xl border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{thread.subject}</p>
                    {thread.unread ? (
                      <Badge className="bg-primary text-primary-foreground">
                        {thread.unread}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{thread.snippet}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">Timeline accent</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mockThreads.map((thread) => (
                <div
                  key={thread.subject}
                  className="border-l-4 border-primary/60 bg-background/30 p-3"
                >
                  <p className="text-sm font-semibold">{thread.subject}</p>
                  <p className="text-xs text-muted-foreground">{thread.snippet}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">Minimal, high whitespace</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {mockThreads.map((thread) => (
                <div key={thread.subject}>
                  <p className="text-sm font-semibold">{thread.subject}</p>
                  <p className="text-xs text-muted-foreground">{thread.snippet}</p>
                  <div className="mt-2 h-px bg-border/60" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
