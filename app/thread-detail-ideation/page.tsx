import { Card, CardContent, CardHeader } from "@/components/ui/card";

const mockMessages = [
  { from: "Alex", body: "Can you approve the roster update?" },
  { from: "You", body: "Yes. Update the schedule for Monday." },
];

export default function ThreadDetailIdeationPage() {
  return (
    <div className="app-shell relative">
      <div className="grain" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Ideation
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Thread Detail Variations
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">Stacked cards</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.body}
                  className="rounded-xl border border-border/60 bg-background/40 p-3"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {msg.from}
                  </p>
                  <p className="text-sm text-foreground">{msg.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">Timeline rail</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mockMessages.map((msg) => (
                <div key={msg.body} className="relative pl-6">
                  <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {msg.from}
                  </p>
                  <p className="text-sm text-foreground">{msg.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">Conversation blocks</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mockMessages.map((msg) => (
                <div
                  key={msg.body}
                  className="rounded-2xl bg-secondary/40 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {msg.from}
                  </p>
                  <p className="text-sm text-foreground">{msg.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
