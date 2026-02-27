import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Clock, Star, Reply } from "lucide-react";

const mockThread = {
  subject: "FM360: Q1 roster — approval needed by Friday",
  from: "Alex Rodriguez",
  date: "Today, 2:14 pm",
  snippet:
    "Hi, wanted to confirm the roster changes before the Friday deadline. We need your sign-off on Tanya's promotion and the two new contractor slots before...",
  summary:
    "Alex is requesting approval on 3 roster changes before Friday EOD. Key items: confirm Tanya's promotion and two new contractor slots. Second follow-up — first sent Tuesday.",
  unread: 2,
};

const ACTIONS = [
  { key: "E", label: "Archive", Icon: Archive },
  { key: "H", label: "Snooze 1 week", Icon: Clock },
  { key: "S", label: "Star", Icon: Star },
  { key: "R", label: "Reply", Icon: Reply, primary: true },
] as const;

const progress = 3;
const total = 12;

export default function TriageIdeationPage() {
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
            Focus Mode · Triage Variations
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            One thread at a time. No noise. Decide: archive, snooze, star, or
            reply — then move on. Eliminates inbox overwhelm by forcing a single
            decision per thread.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Option A: Card stack with progress bar */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">
                Card stack + progress bar
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Thread {progress} of {total}</span>
                <span>{total - progress} remaining</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border/60">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${(progress / total) * 100}%` }}
                />
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold leading-snug">
                      {mockThread.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {mockThread.from} · {mockThread.date}
                    </p>
                  </div>
                  <Badge className="shrink-0 bg-primary text-xs text-primary-foreground">
                    {mockThread.unread}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {mockThread.snippet}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Archive className="h-3.5 w-3.5" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" /> Snooze
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Star className="h-3.5 w-3.5" /> Star
                </Button>
                <Button size="sm" className="gap-1.5 text-xs">
                  <Reply className="h-3.5 w-3.5" /> Reply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Option B: AI summary front and centre, compact actions */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">
                AI summary first, icon actions
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="text-right text-xs text-muted-foreground">
                {progress}/{total}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  AR
                </div>
                <div>
                  <p className="text-sm font-medium">{mockThread.from}</p>
                  <p className="text-xs text-muted-foreground">
                    {mockThread.date}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold leading-snug">
                {mockThread.subject}
              </p>
              <div className="rounded-lg border border-primary/20 bg-primary/8 p-3">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-primary">
                  AI Summary
                </p>
                <p className="text-xs leading-relaxed text-foreground">
                  {mockThread.summary}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {([Archive, Clock, Star] as const).map((Icon, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
                <Button size="sm" className="ml-auto gap-1.5 text-xs">
                  <Reply className="h-3.5 w-3.5" /> Reply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Option C: Keyboard-first, hotkey hints */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">
                Keyboard-first, hotkey hints
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-border/60">
                  <div
                    className="h-1 rounded-full bg-primary"
                    style={{ width: `${(progress / total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {progress}/{total}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug">
                  {mockThread.subject}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {mockThread.from} · {mockThread.date}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {mockThread.snippet}
              </p>
              <div className="h-px bg-border/60" />
              <div className="flex flex-col gap-1.5">
                {ACTIONS.map(({ key, label, Icon, primary }) => (
                  <button
                    key={key}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition ${
                      primary
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className={`rounded px-1 py-0.5 font-mono text-[10px] ${
                        primary
                          ? "bg-white/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {key}
                    </span>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Hotkeys work anywhere on page · Press{" "}
                <span className="font-mono">?</span> for help
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
