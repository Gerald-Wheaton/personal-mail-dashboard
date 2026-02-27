import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const period = "Feb 24 – Feb 27, 2026";
const totalThreads = 18;
const unread = 7;
const needsReply = 4;

const narrative =
  "A busy week. FM360 is pushing for roster confirmation before Friday — Alex Rodriguez needs your sign-off on three changes including Tanya's promotion and two new contractor slots. Two invoice threads from Q4 are still pending your approval. Brian at recruiting is trying to reschedule last week's missed call. The rest is newsletters and FYI updates — nothing urgent.";

const senderGroups = [
  {
    sender: "Alex Rodriguez",
    initials: "AR",
    count: 3,
    latestSubject: "FM360: Q1 roster confirmation",
    needsReply: true,
  },
  {
    sender: "Finance Team",
    initials: "FT",
    count: 2,
    latestSubject: "Q4 Invoice review — please approve",
    needsReply: true,
  },
  {
    sender: "Brian K.",
    initials: "BK",
    count: 2,
    latestSubject: "Reschedule: recruiting sync",
    needsReply: true,
  },
  {
    sender: "Weekly Digest",
    initials: "WD",
    count: 5,
    latestSubject: "Industry roundup & newsletters",
    needsReply: false,
  },
  {
    sender: "Slack Notifications",
    initials: "SN",
    count: 6,
    latestSubject: "Various channel digests",
    needsReply: false,
  },
];

const timeline = [
  {
    date: "Mon Feb 24",
    events: [
      "Invoice batch from Finance Team",
      "Weekly newsletter roundup",
    ],
  },
  {
    date: "Tue Feb 25",
    events: ["Recruiting sync request from Brian K."],
  },
  {
    date: "Wed Feb 26",
    events: [
      "FM360 Q1 roster follow-up from Alex",
      "Q4 final invoice reminder",
    ],
  },
  {
    date: "Thu Feb 27",
    events: [
      "FM360 roster — 2nd follow-up (deadline Friday)",
      "Budget approval nudge from CFO",
    ],
  },
];

export default function DigestIdeationPage() {
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
            AI Digest Variations
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            "What happened in my email this week?" — generated on demand. No
            inbox spelunking required. One button, one read, you're caught up.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Option A: AI prose narrative + stat tiles */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">
                AI prose narrative
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{period}</p>
                <Badge variant="outline" className="text-xs">
                  {totalThreads} threads
                </Badge>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Your week in email
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {narrative}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-primary/10 p-2">
                  <p className="text-xl font-bold text-primary">{unread}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Unread
                  </p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <p className="text-xl font-bold text-amber-600">
                    {needsReply}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Reply
                  </p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-2">
                  <p className="text-xl font-bold text-green-600">
                    {totalThreads - needsReply - unread}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Done
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Option B: Grouped by sender, reply indicator dots */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">
                Grouped by sender
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">{period}</p>
              {senderGroups.map((group) => (
                <div
                  key={group.sender}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {group.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">{group.sender}</p>
                      <Badge
                        variant="outline"
                        className="px-1 text-[10px]"
                      >
                        {group.count}
                      </Badge>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {group.latestSubject}
                    </p>
                  </div>
                  {group.needsReply && (
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  )}
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 align-middle" />
                Amber dot = awaiting your reply
              </p>
            </CardContent>
          </Card>

          {/* Option C: Day-by-day timeline */}
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">
                Chronological timeline
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {timeline.map((day, i) => (
                <div key={day.date} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    {i < timeline.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-border/60" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-xs font-semibold text-foreground">
                      {day.date}
                    </p>
                    {day.events.map((event) => (
                      <p
                        key={event}
                        className="mt-0.5 text-xs leading-relaxed text-muted-foreground"
                      >
                        {event}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
