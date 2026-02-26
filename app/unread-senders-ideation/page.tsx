import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";

const senders = [
  { name: "Riley", count: 4 },
  { name: "Finance", count: 2 },
  { name: "Coach", count: 1 },
];

export default function UnreadSendersIdeationPage() {
  return (
    <div className="app-shell relative">
      <div className="grain" />
      <IdeationNavbar />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Ideation
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Unread Senders Variations
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">Badge chips</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {senders.map((sender) => (
                <Badge
                  key={sender.name}
                  className="border border-primary/40 bg-primary/10 text-primary"
                >
                  {sender.name} {sender.count}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">Stacked rows</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {senders.map((sender) => (
                <div
                  key={sender.name}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2"
                >
                  <span className="text-sm">{sender.name}</span>
                  <Badge className="bg-primary text-primary-foreground">
                    {sender.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">Minimal tags</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {senders.map((sender) => (
                <div key={sender.name}>
                  <p className="text-sm font-semibold">{sender.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sender.count} unread
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
