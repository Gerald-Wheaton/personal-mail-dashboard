import Link from "next/link";

const IDEATION_PAGES = [
  { href: "/", label: "Home" },
  { href: "/thread-list-ideation", label: "Thread List" },
  { href: "/thread-detail-ideation", label: "Thread Detail" },
  { href: "/summary-card-ideation", label: "Summary Card" },
  { href: "/chat-panel-ideation", label: "Chat Panel" },
  { href: "/unread-senders-ideation", label: "Unread Senders" },
];

export function IdeationNavbar() {
  return (
    <nav className="relative z-30 border-b border-primary/40 bg-primary/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-6 py-3">
        <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Dev ideation nav
        </span>
        {IDEATION_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/15"
          >
            {page.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
