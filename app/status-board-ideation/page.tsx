import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const kanbanColumns = [
  {
    id: "needs-reply",
    label: "Needs Reply",
    colorText: "text-amber-600",
    colorBg: "bg-amber-500/10",
    threads: [
      { subject: "FM360 Q1 roster", from: "Alex Rodriguez", date: "Today" },
      { subject: "Q4 invoice review", from: "Finance Team", date: "Yesterday" },
      { subject: "Recruiting sync", from: "Brian K.", date: "Tue" },
    ],
  },
  {
    id: "waiting",
    label: "Waiting",
    colorText: "text-blue-600",
    colorBg: "bg-blue-500/10",
    threads: [
      { subject: "Contract revision", from: "Legal", date: "Mon" },
      { subject: "Budget approval", from: "CFO", date: "Feb 20" },
    ],
  },
  {
    id: "done",
    label: "Done",
    colorText: "text-green-600",
    colorBg: "bg-green-500/10",
    threads: [
      { subject: "Onboarding docs", from: "HR", date: "Feb 18" },
      { subject: "Weekly standup", from: "Team", date: "Feb 17" },
    ],
  },
];

const inlineThreads = [
  { subject: "FM360 Q1 roster", from: "Alex", status: "needs-reply" as const },
  { subject: "Q4 invoice", from: "Finance", status: "needs-reply" as const },
  { subject: "Contract revision", from: "Legal", status: "waiting" as const },
  { subject: "Budget approval", from: "CFO", status: "waiting" as const },
  { subject: "Onboarding docs", from: "HR", status: "done" as const },
  { subject: "Weekly standup", from: "Team", status: "done" as const },
];

const statusMeta = {
  "needs-reply": {
    label: "Reply",
    className: "border-amber-400 text-amber-600",
  },
  waiting: { label: "Waiting", className: "border-blue-400 text-blue-600" },
  done: { label: "Done", className: "border-green-400 text-green-600" },
};

const priorityThreads = [
  {
    subject: "FM360 Q1 roster — deadline Friday",
    from: "Alex Rodriguez",
    urgency: "HIGH" as const,
    score: 94,
  },
  {
    subject: "Q4 invoice — overdue",
    from: "Finance Team",
    urgency: "HIGH" as const,
    score: 87,
  },
  {
    subject: "Recruiting sync",
    from: "Brian K.",
    urgency: "MED" as const,
    score: 62,
  },
];

export default function StatusBoardIdeationPage() {
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
            Thread Status Board Variations
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Move threads through a simple pipeline: Needs Reply → Waiting →
            Done. Your inbox as a board, not a list — zero ambiguity about what
            needs action.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Option A: Kanban columns */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">Kanban columns</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {kanbanColumns.map((col) => (
                  <div key={col.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${col.colorText}`}
                      >
                        {col.label}
                      </span>
                      <Badge variant="outline" className="px-1 text-[10px]">
                        {col.threads.length}
                      </Badge>
                    </div>
                    <div
                      className={`flex flex-col gap-1.5 rounded-xl p-2 ${col.colorBg}`}
                    >
                      {col.threads.map((t) => (
                        <div
                          key={t.subject}
                          className="rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                        >
                          <p className="text-xs font-medium leading-snug">
                            {t.subject}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t.from} · {t.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Option B: Inline status badge per thread */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">
                Inline status per thread
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Click any status pill to cycle it forward
              </p>
              {inlineThreads.map((t) => {
                const meta = statusMeta[t.status];
                return (
                  <div
                    key={t.subject}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {t.subject}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t.from}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 px-1.5 text-[10px] ${meta.className}`}
                    >
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Option C: Priority queue — top 3 + urgency scores */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">
                Priority queue — top 3
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <p className="text-xs text-muted-foreground">
                AI-ranked threads that need your attention most
              </p>
              {priorityThreads.map((t, i) => (
                <div key={t.subject} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug">
                      {t.subject}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.from}
                    </p>
                    <div className="mt-1.5 h-1 w-full rounded-full bg-border/60">
                      <div
                        className={`h-1 rounded-full ${
                          t.urgency === "HIGH" ? "bg-amber-500" : "bg-primary"
                        }`}
                        style={{ width: `${t.score}%` }}
                      />
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] ${
                      t.urgency === "HIGH"
                        ? "border-amber-400 text-amber-600"
                        : ""
                    }`}
                  >
                    {t.urgency}
                  </Badge>
                </div>
              ))}
              <div className="h-px bg-border/60" />
              <p className="text-[10px] text-muted-foreground">
                Score = unread count × recency × questions detected × urgency
                keywords
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
