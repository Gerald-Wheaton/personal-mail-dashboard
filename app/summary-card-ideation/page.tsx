import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IdeationNavbar } from "@/components/dashboard/IdeationNavbar";

export default function SummaryCardIdeationPage() {
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
            Summary Card Variations
          </h1>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option A</h2>
              <p className="text-sm text-muted-foreground">Inline refresh</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">
                Quick summary with bullet-like phrasing.
              </p>
              <Button className="bg-primary text-primary-foreground">
                Refresh
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option B</h2>
              <p className="text-sm text-muted-foreground">Split layout</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm">
                Summary appears inside a recessed surface.
              </div>
              <Button variant="secondary">Regenerate</Button>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70">
            <CardHeader>
              <h2 className="text-lg font-semibold">Option C</h2>
              <p className="text-sm text-muted-foreground">Minimal</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">
                Simple paragraph summary with light divider.
              </p>
              <div className="h-px bg-border/60" />
              <Button size="sm" className="bg-primary text-primary-foreground">
                Update
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
