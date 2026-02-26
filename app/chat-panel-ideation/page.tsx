import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";

export default function ChatPanelIdeationPage() {
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
            Chat Panel Variations
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">Compact stack</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl bg-secondary/40 p-3 text-sm">
                User: What needs my reply?
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-sm">
                Assistant: They want approval and a timeline.
              </div>
              <div className="flex gap-2">
                <Input placeholder="Ask" />
                <Button size="sm">Send</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">Chat bubble</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl bg-background/40 p-3 text-sm">
                User bubble with subtle border.
              </div>
              <div className="rounded-2xl bg-primary/15 p-3 text-sm">
                Assistant bubble with contrast.
              </div>
              <Input placeholder="Ask in one sentence" />
              <Button size="sm" className="bg-primary text-primary-foreground">
                Ask
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">Split input</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm">
                Thread Q&A with scroll area.
              </div>
              <div className="flex gap-2">
                <Input placeholder="What should I answer?" />
                <Button size="sm" variant="secondary">
                  Ask
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
